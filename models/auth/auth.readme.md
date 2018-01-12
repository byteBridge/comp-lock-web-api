## User.js

## Routes available

The following routes are available for the ```Auth``` resource. They are all prefixed by ```/api/v1/auth```.

| Methods | Path | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | '/login' | None | User logs in to the system |
| `POST` | '/logout' | Required | Sign out of the system |

## #create()

This method creates a new user in the database

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.post('/api/v1/auth/login', {
    username: 'username',
    password: 'password'
  })

  console.log(res.data)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```json
{
    "message": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imt1ZGFrd2FzaGUiLCJleHAiOjE1MTU5MzcyODMsImlhdCI6MTUxNTMzMjQ4M30.9KTySPX3vN-8MeFu0ub9U2ILWMUwPW1Iu8iKXRj-PxA",
    "user": {
        "username": "kudakwashe",
        "f_name": "Kudakwashe",
        "s_name": "Paradzayi",
        "blocked": false,
        "gender": "M",
        "email": "kgparadzayi@gmail.com",
        "created_at": "2017-10-30T15:37:49.032Z",
        "updated_at": "2017-10-30T16:46:10.593Z",
        "type": "administrator",
        "login_time": null,
        "computer_name": null,
        "time_limit": null
    }
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

  const res = await axios.post('/auth/login', {
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

```json
{
  "message": "invalid login details"
}
```
---