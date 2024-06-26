import './App.css';
import React from 'react';
import LoginButton from './LoginButton';
import { MsalProvider } from "@azure/msal-react";
import logo from "./image/logo.png";
import chat from './image/chat.png';
import Protected from './Protected';
import Emails from './Emails';
import OneEmail from './OneEmail';
import PageBar from './PageBar';
import ContentBar from './ContentBar';
import ChatBox from './ChatBox';
import SummaryBox from './SummaryBox';
import DailySummary from './DailySummary';

class App extends React.Component{
  constructor(props) {
    super(props);

    this.state = { login: 0, folder: 0, page: 1, total_num: 0, token: "", emails: [], selected_email: -1, selected_content: {}, selected_category: "", selected_email_summary: '', clicked_time: 0, selected_chat: false, message_list: [], selected_chat_type: '0', daily_summary: [], daily_page: 0};
    
    this.update = this.update.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateFolder = this.updateFolder.bind(this);
    this.getEmails = this.getEmails.bind(this);
    this.getOneEmail = this.getOneEmail.bind(this);
    this.returnFromOneEmail = this.returnFromOneEmail.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getEmailSummary = this.getEmailSummary.bind(this);
    this.getDailySummary = this.getDailySummary.bind(this);
  };

  
  update(nextState) {
    this.setState(nextState);
  }

  updatePage(page, token) {
    this.setState({ page: page });
    
    if (this.state.folder === 0) {
      this.getEmails(page, token);
    } else {
      this.getEmailsByCategory(page, this.state.folder, token);
    }
  }

  updateFolder(folder, token) {
    this.update({ folder: folder });

    if (folder === 0) {
      this.getEmails(1, token);
    } else {
      this.update({ page: 1 });
      this.getEmailsByCategory(folder, 1, token);
    }
  }

  returnFromOneEmail(folder) {
    let time_spent = Math.round((Date.now() - this.state.clicked_time) / 1000);

    fetch('http://localhost:5000/metrics/recordTime/' + this.state.selected_email, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      },
      body: JSON.stringify({"timeSpent": time_spent})
    })
      .then(response => response.json())
      .then(() => {
      this.setState({ folder: folder, selected_email: -1, selected_content: {}, clicked_time: 0, selected_chat: false, selected_email_summary: ''});
      })
      .catch(error => {
        console.log(error);
    })
  }

  getEmails(page, token) {
    fetch('http://localhost:5000/emails?page=' + page, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': token
      }
    })
      .then(response => response.json())
      .then((data) => {

        if (data.emails === typeof undefined || data.emails === undefined || data.emails === null) {
          this.update({ emails: [], total_num: 0 });
        }
        else {
          this.update({ emails: data.emails, total_num: data.totalEmails });
        }
      })
    .catch(error => {
      console.log(error);
    })
  }

  getEmailsByCategory(category, page, token) {
    fetch(`http://localhost:5000/emails/getByCategory?page=${page}&category=${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': token
      }
    })
      .then(response => response.json())
      .then((data) => {
        if (data.emails !== typeof undefined || data.emails !== undefined || data.emails !== null) {
          this.update({ emails: data.emails, total_num: data.totalEmails, folder: category });
        } else {
          this.update({emails: [], total_num: 0, folder: category });
        }
      })
      .catch(error => {
        console.log(error);
    })
  }

  getOneEmail(id, token) {
    this.update({ selected_email: id });

    fetch('http://localhost:5000/emails/' + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': token
      }
    })
      .then(response => response.json())
      .then((data) => {

        let content = {};

        content["category"] = data.email.category;
        content["from_address"] = data.email.sender.address;
        content["from_name"] = data.email.sender.name;
        content["body"] = data.email.body;
        content["bcc"] = data.email.bcc;
        content["cc"] = data.email.cc;
        content["subject"] = data.email.subject;  
        content['ics'] = data.email.ics; 
        content['score'] = data.email.importanceScore;
        content['link'] = data.email.webLink;

        this.update({ selected_content: content, selected_category: data.email.category, clicked_time: Date.now(), message_list: [], selected_email_summary: '', daily_page: 0} );

      })
      .catch(error => {
        console.log(error);
    })
  }

  changeCategory( id, category) {
      fetch("http://localhost:5000/emails/changeCategory/" + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
        },
      body: JSON.stringify({"newCategory": category})
    })
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        let content = this.state.selected_content;
        content["category"] = category;
        this.setState({ selected_content: content });
      })
      .catch(error => {
        console.log(error);
    })
  }

  sendMessage(message) {

    let whiteList = [];
    let prefList = [];
    let type = '';

    if (this.state.selected_chat_type === '0') {
      whiteList.push(message);
      type = 'White-List';
    } else if (this.state.selected_chat_type === '1'){
      prefList.push(message);
      type = 'Preference';
    } else if (this.state.selected_chat_type === '2') {
      this.smartSearch(message);
      return;
    }
    let new_msg_list = this.state.message_list;
    new_msg_list.push(type + ': ' + message);
    this.update({ message_list: new_msg_list });
    
    fetch('http://localhost:5000/pref/updatePreferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      }, 
      body: JSON.stringify({ 'whitelist': whiteList, 'prefList': prefList})
    })
      .then(response => response.json())
      .then((data) => {
        new_msg_list.push(type + ' is updated')
        
        this.update({ message_list: new_msg_list });
        console.log(data);
      }).catch(error => {
        console.log(error);
        new_msg_list.push('Please try again later')
        this.update({
          message_list: new_msg_list
        });
    })
  }

  getEmailSummary() {
    fetch('http://localhost:5000/emails/getSummary/' + this.state.selected_email, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      }
    })
      .then(response => response.json())
      .then(data => {
        this.update({ selected_email_summary: data.summary });
        }).catch(error => {
        console.log(error);
    })
  }

  getDailySummary() {
    fetch('http://localhost:5000/emails/dailySummary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.summary === null) {
          this.update({ daily_summary: "", daily_page: 0});
        }
        else {
          this.update({ daily_summary: data.summary, daily_page: 1});
        }
      })
      .catch(error => {
        console.log(error);
    })
  }

  searchKeywords() {
    let search = document.getElementById('searchString').value;

    if (search.length === 0 || search === undefined || search === typeof undefined) {
      return;
    }

    fetch('http://localhost:5000/emails/search?searchString='+search, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      },
    })
      .then(response => response.json())
      .then(data => {

        if (data.emails === undefined || data.emails === typeof undefined) {
          this.update({ emails: [], total_num: 0, selected_email: -1, selected_content: {}  });
        } else {
          this.update({ emails: data.emails, total_num: data.totalEmails, selected_email: -1, selected_content: {} });
        }
      })
      .catch(error => {
        console.log(error);
    })
  }

  smartSearch(message) {
    
    if (message === "" || message === undefined || message === typeof undefined) {
      return;
    }

    fetch('http://localhost:5000/emails/smartSearch?searchString=' + message, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': this.state.token
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.emails === undefined || data.emails === typeof undefined) {
        this.update({emails: [], total_num: 0,selected_email: -1, selected_content: {} })
        } else {
          this.update({ emails: data.emails, total_num: data.totalEmails, selected_email: -1, selected_content: {} });
      }
      })
      .catch(error => {
        console.log(error);
    })
  }
  
  generateICS(id) {
    fetch('http://localhost:5000/emails/generateICS/' + id, {
      method: 'GET'
    })
      .then(response => response.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'event.ics'; // or any other filename you want
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(error => {
        console.log(error);
    })

  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.searchKeywords();
      e.target.value = '';
    }
  }
  render() {
    return (
      <MsalProvider id="App" instance={this.props.msalInstance}>
        
        {
          this.state.token === "" && <div id='login-page'>
            <img src={logo} alt='logo' id='login-logo' />
            <LoginButton id='login-button' update={this.update} getEmails={this.getEmails} token={this.state.token} page={this.state.page} />
          </div>
        }

        {this.state.token !== "" && <div id='top-bar'>
          <img src={logo} alt="logo" id="logo" onClick={ ()=>this.returnFromOneEmail(0)} />
          <input type="text" id="searchString" onKeyDown={this.handleKeyDown} />

          <button id='daily-summary-button' onClick={()=>this.getDailySummary()}>Get Daily Feed</button>
          
          <LoginButton id="logout-button" update={this.update} getEmails={this.getEmails} token={this.state.token} page={this.state.page} />
        </div>}

        <Protected updateToken={this.update} getEmails={this.getEmails} page={this.state.page} />
        
        {this.state.token !== "" && this.state.selected_email === -1 && <ContentBar id="content-col" updateFolder={this.updateFolder} folder={this.state.folder} token={this.state.token} />}

        {this.state.token !== "" && this.state.selected_email === -1 && this.state.emails !== typeof undefined && <Emails id="email-col" page={this.state.page} emails={this.state.emails} token={this.state.token} getOneEmail={this.getOneEmail} />}
        
        {this.state.token !== "" && this.state.selected_email !== -1 && <OneEmail id="one-email" email={this.state.selected_content} email_id={this.state.selected_email} go_back={this.returnFromOneEmail} folder={this.state.folder} change_category={this.changeCategory} selected_category={this.state.selected_category} update={this.update} get_summary={this.getEmailSummary} summary={ this.state.selected_email_summary} get_ics={this.generateICS}/>}
        {this.state.token !== '' && this.state.selected_email_summary.length > 0 && <SummaryBox id='summary' update={this.update} summary={this.state.selected_email_summary}/>}
        

        {this.state.token !== '' && this.state.daily_page !== 0 && this.state.daily_summary.length > 0 && <DailySummary id='daily-summary-box' summary={this.state.daily_summary} page={this.state.daily_page} update={ this.update} />}

        {this.state.token !== "" && this.state.selected_chat === false && <img src={chat} alt='chatbox' id='chat' onClick={()=>this.update({selected_chat: true})}/>}
        {this.state.token !== "" && this.state.selected_chat === true && <ChatBox id="chatbox" update={this.update} send_message={this.sendMessage} chat_type={this.state.selected_chat_type} message_list={ this.state.message_list} />}
        
        {this.state.token !== "" && this.state.selected_email === -1 && <PageBar id="page-bar" page={this.state.page} updatePage={this.updatePage} total_num={this.state.total_num} token={ this.state.token} />}
      </MsalProvider>
    )
  };
}
export default App;
