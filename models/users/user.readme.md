## User.js

### create

This method creates a new user in the database

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
