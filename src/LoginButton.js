import React from 'react';
import { useMsal } from '@azure/msal-react';
import Protected from './Protected';

const LoginButton = () => {
  const { instance, accounts } = useMsal(); // basically everything with auth uses the instance from MSAL
  // accounts is an array of all the accounts that are signed in

  const handleLogin = async () => {
    const loginRequest = {
      // the scopes we need
      scopes: ["User.ReadBasic.All", "User.read", "Files.Readwrite.All", "Sites.Readwrite.All", "Mail.Read", "Mail.ReadBasic", 
      "Mail.ReadWrite", "MailboxSettings.Read"], // Add any additional scopes required by your application
    };

    try {
      // Open a popup for login
      let response = await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    const logoutRequest = {
      account: accounts[0], // Assuming there is only one signed-in account
    };

    instance.logoutPopup(logoutRequest);
  };

  return (
    <div>
      {accounts.length === 0 ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <Protected />
        </div>
      )}
    </div>
  );
};

export default LoginButton;