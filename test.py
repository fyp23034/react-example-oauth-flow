import requests

access_token = "EwCAA8l6BAAUAOyDv0l6PcCVu89kmzvqZmkWABkAARkmuIgHxPQJpoZidfPXbRmqhVoTPZHXB+W+RExJGSVfDcIZ9VOU5yJxs5mBgGO/1F4F9YHikvj5T65l+zB3yBlyNYnlVwFj8n+/D6uWNxewhZcbfa8Slq57gPR5hI0hC1eE3/rVU79JDAd0hGmLLtIh4VAk8xYzT2nTOTaUjYGq+n+Nctnpxcw+z0GyXCIzjnwSNQISjwaM14BkfzG1EetfsHHoeKJ50W4sTzceq+VFBstLvSSPWZfg1YEseCc1bVdZboFkodAPFjHli/4GsDm7kU4OJtKnOgFeIQT/UUdwvhr2i4JmW7Df+rDLDunF1e5aQHRSUABFL5eRxA0MLKgDZgAACOVs74NZZjG+UAK+AYqe/VXP+brKy4STEEmJFAsPigp/88Jrj8RwUJooR0I/NBxpNQSqnO7Xlbfe8zE2OAp/VEdSurLdn6yFwiBnGIEs9DuQEO5RgjMkPauDpcNvCjXBJyTlbl59PMrYUtbKTtk4hW3vIwoUGwcNYHX6WsEeI1XDTlpZvHIFfvotW7ys7M2QaiuS/RqCPMO0SDJVPipr3ygBiTiR8dGCLy+4uLAodvWNjRZsmgvnFcIE3PQ6TLt/DZwSVkcF7ccSHy4jwu0AhTPkdnP+HDBna1T0R8nBEIdcjF3DTy/ccskUqHbEtLcBv1zncmQQHj2ghFhSubBAw8Pf5HLVIzrYcDp3mjAZEJIozIKPqK21QWCS6SWrrmm6sE1V3IdY/kNa7OXfhREd6s1ORqiwahwFWoYsoWumN/BkmvqnBDWpv0szK6ZVcn2piPxcB4mAHcC69N70h4ySNz8e9bwDR8emtiaR7RkPKTH8zHlvnGgBIjmiGhW+CXNqBKejb//SX3Q5OGRllBSsFnQYtpBIuX+POjfNzGBxbNLz2rnIbLbYLokssxjyv62Ma8u/V+bCZ94ZrIB+o454ZXx9hlwnPDy8QdOPOMyhy877QNRL/ybcgzeCRNyyc4b0fUOnbaHqlyUs/hb+jku0Nju1mm2jehe49/9CFzgrmI30VvE/emcSTrk51U3t+Il1vFP6Egkc2nQFSXIi/ujarCeMK/SWRb0CxpJHkQgCYy5WMd7TKCM4FBhEZrKSLT3QWkfXSj6Jg0kRDqoisAWgSxoKv3hgssdydopniwI="
# feel free to edit endpoint
endpoint = f'https://graph.microsoft.com/v1.0/me/messages'
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(endpoint,headers=headers)
s = response.json()
print(s)