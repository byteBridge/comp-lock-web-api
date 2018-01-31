## User.js

## Routes available

The following routes are available for the ```Computer``` resource. They are all prefixed by ```/api/v1/computer```.

| Methods | Path | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | '/new' | Admin Required | Add a new computer to the system |
| `GET` | '/' | Required | Gets all the computers registered in the system |
| `PUT` | '/deactivate' | Admin Required | Deactivate the computer so that it is not accessible |
| `PUT` | '/reactivate' | Admin Required | Reactivate the computer so that it can be accessible |
| `Delete` | '/unregister' | Admin Required | Remove the computer from the system |

## #create()

This method creates a new computer in the database

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.post('/api/v1/computers/new', {
    name: 'computer3'
  })

  console.log(res.data)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```json
{
    "message": "successfully created computer.",
    "computer": {
        "name": "computer3",
        "active": true,
        "created_at": "2018-01-12T16:25:11.893Z"
    }
}
```

### Error response

**If no token is provided**
```json
{
    "message": "No token provided."
}
```

**validation errors**
```json
{
    "message": "Validation errors occured",
    "error": {
        "message": "Validation errors occured",
        "errors": [
            {
                "message": "\"name\" is required",
                "path": "name",
                "type": "any.required",
                "context": {
                    "key": "name"
                }
            }
        ],
        "status": 400
    }
}
```
---
## #getAllComputers()

Returns all the computers in the databse

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.post('/api/v1/computers')

  console.log(res)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```js
{
    "computers": [
        {
            "name": "computer1",
            "active": true,
            "created_at": "2018-01-12T15:56:42.181Z",
            "username": "garikai",
            "login_time": "18:15:41",
            "login_date": "2018-01-12T18:15:41.522+02:00",
            "computer_name": "computer1",
            "status": "in_use"
        },
        {
            "name": "computer3",
            "active": true,
            "created_at": "2018-01-12T16:25:11.893Z",
            "username": null,
            "login_time": null,
            "login_date": null,
            "computer_name": null,
            "status": "available"
        }
    ]
}
```

### Error response

**If no token is provided**
```json
{
    "message": "No token provided."
}
```
---

## #deactivate()

Deactivate the computer so that it is not accessible

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.put('/api/v1/computers/deactivate', {
    name: 'computer3'
  })

  console.log(res.data)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```json
{
    "message": "successfully deactivated computer."
}
```

### Error response

**If no token is provided**
```json
{
    "message": "No token provided."
}
```
---


## #reactivate()

Deactivate the computer so that it is not accessible

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.put('/api/v1/computers/reactivate', {
    name: 'computer3'
  })

  console.log(res.data)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```json
{
    "message": "successfully reactivated computer."
}
```

### Error response

**If no token is provided**
```json
{
    "message": "No token provided."
}
```
---


## #unregister()

Deactivate the computer so that it is not accessible

**Usage**
```javascript
  const axios = require('axios')

  const res = await axios.delete('/api/v1/computers/unregister', {
    name: 'computer3'
  })

  console.log(res.data)
```

> The responses below are just a demo to show the keys that the response object may have 
### Success response

```json
{
    "message": "successfully unregistered computer."
}
```

### Error response

**If no token is provided**
```json
{
    "message": "No token provided."
}
```
---