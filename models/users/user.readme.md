## User.js

## Routes available

The following routes are available for the ```User``` resource. They are all prefixed by ```/api/v1/users```.

| Methods | Path | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | '/' | Requied | Returns a list of all the users in the system |
| `POST` | '/new' | Admin required | Create a new account. |
| `GET` | '/online' | Admin required | View all non admin accounts that are logged in no the desktop application |
| `PUT` | '/online/:username/clear' | Admin required | Clear an account from online |
| `GET` | '/:username' | Required | Get profile info for a single user |
| `GET` | '/:username/history' | Required | Gets the login history of a single non admin account |
| `PUT` | '/:username/block' | Admin required | Revokes access to the desktop client fro the user, but the user can still log in from the web |
| `PUT` | '/:username/unblock' | Admin required | Restores access to the desktop client for the blocked user |
| `PUT` | '/:username/password' | Required | Change the password for a particular user |
| `GET` | '/timelimits' | Required | Get an array of the time limits for all the account types |
| `POST` | '/timelimits/new' | Admin required | Create a new user type with time limits |
| `GET` | '/timelimits/:userType' | Required | Gets the timelimits for a particular user type |
| `PUT` | '/timelimits/:userType' | Admin required | Updates the time limits for a particulr user type |


## #create()

This method creates a new user in the database

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.post('/auth/login', {
    username: 'username',
    password: 'password'
  })

  const token = res.data.token
  const config = { headers: { Authorization: `${token}` } }

  let newUser = {
    f_name: 'Tapiwanashe',
    s_name: 'makotose',
    type: 'student',
    gender: 'Male',
    username: 'tapsmakots',
    password: 'oi3y4384ieurhgi3h4',
    email: 'taps@goo.com'
  }

  const response = await axios.post('/api/v1/users/new', newUser, config)
  console.log(response.data.user)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```js
{
  username: 'tapsmakots',
  password: 'oi3y4384ieurhgi3h4',
  created_at: 2017-11-19T17:54:49.310Z,
  updated_at: 2017-11-19T17:54:49.310Z,
  type: 'student',
  gender: 'Male',
  f_name: 'Tapiwanashe',
  s_name: 'makotose',
  blocked: false,
  email: 'taps@goo.com'
}
```

### Error response

```js
{
  message: 'An error occured',
  errors: ['Missing username', 'Username must be 6 characters long'] // in the case of invalid input
}
```
---
## #login()

This method logs in a new user

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.post('/api/v1/auth/login', {
    username: 'username',
    password: 'password'
  })

  console.log(res)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```js
{
  username: 'kudakwashe',
  f_name: 'Kudakwashe',
  s_name: 'Paradzayi',
  blocked: false,
  gender: 'M',
  email: 'kgparadzayi@gmail.com',
  created_at: 2017-11-19T22:21:54.749Z,
  updated_at: 2017-11-19T22:21:54.749Z,
  type: 'administrator',
  login_time: null,
  computer_name: null,
  time_limit: null,
  token: 'asadasadzd234edfere2'
}
```

### Error response

```js
{
  message: 'An error occured',
  status: 401
}
```
---