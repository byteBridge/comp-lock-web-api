require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const User =  require('./')
const knex = require('../../database')

describe('#User.create()', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())
  let newUser = {
    f_name: 'Tapiwanashe',
    s_name: 'makotose',
    type: 'student',
    gender: 'Male',
    username: 'tapsmakots',
    password: 'oi3y4384ieurhgi3h4',
    email: 'taps@goo.com'
  }

  it('should successfully create a new use', async () => {
    const user = new User()
    const createdUser = await user.create(newUser)
    createdUser.should.be.a('object')
    createdUser.should.contain.keys(...Object.keys(newUser), 'created_at', 'updated_at')
  })

  it('should fail if the user already exists', async () => {
    const user = new User()
    let userInDb = Object.assign({}, newUser)
    userInDb.username = 'kudakwashe'
    try {
      const createdUser = await user.create(userInDb)
    } catch (error) {
      should.exist(error)
      error.message.should.eql('User already exists in the database')
    }

  })

  it('should fail if the username is not provided', async () => {
    let errorMessages = ['"username" is not allowed to be empty', '"username" length must be at least 6 characters long']
    await failToCreateWithMissingValue(newUser, 'username', ...errorMessages)
  })

  it('should fail if the password is not provided', async () => {
    let errorMessages = ['"password" is not allowed to be empty', '"password" length must be at least 8 characters long']
    await failToCreateWithMissingValue(newUser, 'password', ...errorMessages)
  })

  it('should fail if the name (f_name) is not provided', async () => {
    let errorMessages = ['"f_name" is not allowed to be empty', '"f_name" length must be at least 3 characters long']
    await failToCreateWithMissingValue(newUser, 'f_name', ...errorMessages)
  })

  it('should fail if the surname (s_name) is not provided', async () => {
    let errorMessages = ['"s_name" is not allowed to be empty', '"s_name" length must be at least 3 characters long']
    await failToCreateWithMissingValue(newUser, 's_name', ...errorMessages)
  })

  it('should fail if the user type (type) is not provided', async () => {
    let errorMessages = ['"type" is not allowed to be empty', '"type" length must be at least 6 characters long']
    await failToCreateWithMissingValue(newUser, 'type', ...errorMessages)
  })

  /* ======================================= MISSING KEYS =========================================== */
  it('should fail if the username key is not provided', async () => {
    let errorMessages = ['"username" is required']
    await failToCreateWithMissingKey(newUser, 'username', ...errorMessages)
  })

  it('should fail if the password key is not provided', async () => {
    let errorMessages = ['"password" is required']
    await failToCreateWithMissingKey(newUser, 'password', ...errorMessages)
  })

  it('should fail if the name (f_name) key is not provided', async () => {
    let errorMessages = ['"f_name" is required']
    await failToCreateWithMissingKey(newUser, 'f_name', ...errorMessages)
  })

  it('should fail if the surname (s_name) key is not provided', async () => {
    let errorMessages = ['"s_name" is required']
    await failToCreateWithMissingKey(newUser, 's_name', ...errorMessages)
  })

  it('should fail if the gender key is not provided', async () => {
    let errorMessages = ['"gender" is required']
    await failToCreateWithMissingKey(newUser, 'gender', ...errorMessages)
  })

  it('should fail if the user type (type) key is not provided', async () => {
    let errorMessages = ['"type" is required']
    await failToCreateWithMissingKey(newUser, 'type', ...errorMessages)
  })


  /**
   * @description This function is intended to attemp to create a user with all keys (fields) but having some keys with no values
   * @param {*} newUser The user to be created. Ideal with all the required key fields
   * @param {*} value The key (field) of the newUser object that is to be made empty
   * @param {*} errorMessages A list of error messages resulting from joi validations
   */
  async function failToCreateWithMissingValue (newUser, value, ...errorMessages) {
    const user = new User()
    let userWithoutValue = Object.assign({}, newUser)
    userWithoutValue[value] = ''
    try {
      const createdUser = await user.create(userWithoutValue)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }

  /**
   * @description This function is intended to attemp to create a user with missing keys (fields)
   * @param {*} newUser The user to be created. Ideal with all the required key fields
   * @param {*} key The key (field) of the newUser object that is to be deleted
   * @param {*} errorMessages A list of error messages resulting from joi validations
   */
  async function failToCreateWithMissingKey (newUser, key, ...errorMessages) {
    const user = new User()
    let userWithoutKey = Object.assign({}, newUser)
    delete userWithoutKey[key]
    try {
      const createdUser = await user.create(userWithoutKey)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }
})


describe('#User.login()', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())
  const adminCredentials = { username: 'kudakwashe', password: 'paradzayi' }
  const studentCredentialsForDesktop = { username: 'garikai', password: 'rodneygg', computer_name: 'computer1' }
  const studentCredentialsForDesktopTimeUp = { username: 'denzel', password: 'makombeshushi', computer_name: 'computer1' }
  const studentCredentialsForDesktopBlocked = { username: 'stephen', password: 'kundicme', computer_name: 'computer2' }
  const studentCredentialsForDesktopComputerDeactivated = { username: 'garikai', password: 'rodneygg', computer_name: 'computer5' }
  const studentCredentialsForDesktopComputerUnregistered = { username: 'garikai', password: 'rodneygg', computer_name: 'computer500' }
  const studentCredentialsForWeb = { username: 'garikai', password: 'rodneygg' }

  it('should login an administrator', async () => {
      const user = new User()
      const authUser = await user.login(adminCredentials)
      should.exist(authUser)
      authUser.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at'])
      authUser.should.not.contain.keys('password')
  })


  it('should log in a student from the web ui', async () => {
    const user = new User()
    const response = await user.login(studentCredentialsForWeb)
    should.exist(response)
    response.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at', 'computer_name', 'time_limit'])
    response.should.not.contain.keys('password')
  })

  it('should log in a student from the desktop', async () => {
      const user = new User()
      const response = await user.login(studentCredentialsForDesktop)
      should.exist(response)
      response.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at', 'computer_name', 'login_time', 'remaining_time', 'time_limit', 'used_time'])
      response.should.not.contain.keys('password')
  })

  it('should not log in a student from the desktop who has used time', async () => {
    const user = new User()
    try {
      await user.login(studentCredentialsForDesktopTimeUp)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql('We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.')
    }
  })


  it('should not log in a with an empty username', async () => {
    let errorMessages = ['"username" is not allowed to be empty', '"username" length must be at least 6 characters long']
    await failToSigninWithMissingValue(studentCredentialsForDesktop, 'username', ...errorMessages)
  })

  it('should not log in a with an empty password', async () => {
    let errorMessages = ['"password" is not allowed to be empty', '"password" length must be at least 8 characters long']
    await failToSigninWithMissingValue(studentCredentialsForDesktop, 'password', ...errorMessages)
  })

  it('should not log in a student from the desktop who been blocked', async () => {
    const user = new User()
    try {
      await user.login(studentCredentialsForDesktopBlocked)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`We regret to inform you that your account qualifies to be blocked. Report by the librarian's desk to have it unblocked`)
    }
  })

  it('should not log in a student from the desktop when his/her account is online on another computer', async () => {
    const user = new User()
    try {
      await user.login(studentCredentialsForDesktop)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`Your account is already signed in on computer: ${studentCredentialsForDesktop.computer_name}`)
    }
  })

  it('should not log in a student from a deactivated computer', async () => {
    const user = new User()
    try {
      await user.login(studentCredentialsForDesktopComputerUnregistered)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`${studentCredentialsForDesktopComputerUnregistered.computer_name} is not registered. Consult the admin to register the computer for you.`)
    }
  })

  it('should not log in a student from a deactivated computer', async () => {
    const user = new User()
    try {
      await user.login(studentCredentialsForDesktopComputerDeactivated)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`${studentCredentialsForDesktopComputerDeactivated.computer_name} was deactivated. Consult the admin to re activate the computer for you.`)
    }
  })
  /**
   * @description This function is intended to attemp to create a user with missing keys (fields)
   * @param {*} newUser The user to be created. Ideal with all the required key fields
   * @param {*} key The key (field) of the newUser object that is to be deleted
   * @param {*} errorMessages A list of error messages resulting from joi validations
   */
  async function failToSigninWithMissingValue (credentials, key, ...errorMessages) {
    let credentialsWithoutValue = Object.assign({}, credentials)
    const user = new User()
    credentialsWithoutValue[key] = ''
    try {
      await user.login(credentialsWithoutValue)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }

})

describe('#User.findOne()', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())
  let existingUser = {
    username: 'garikai',
    type: 'student',
    f_name: 'Garikai',
    s_name: 'Gumbo',
    gender: 'Male',
    email: 'grod56@gmail.com'
  }
 
  
  it('should return a single user from the database', async () => {
    const user = new User()
    const foundUser = await user.findOne('garikai')
    foundUser.should.be.a('object')
    foundUser.should.not.contain.keys('password')
    foundUser.should.contain.keys(...Object.keys(existingUser), 'created_at', 'updated_at')
    for (key in existingUser) {
      foundUser[key].should.eql(existingUser[key])
    }
  })

  it('should fail if username key is not provided', async () => {
    const user = new User()
    try {
      const foundUser = await user.findOne()
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('message')
      error.message.should.eql('Username is required')
    }
  })


  it('should fail if username key is an empty string', async () => {
    const user = new User()
    try {
      const foundUser = await user.findOne('')
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('message')
      error.message.should.eql('Username is required')
    }
  })


  it('should fail if the username username does not match the user in the database', async () => {
    const user = new User()
    try {
      const foundUser = await user.findOne('tainashenasheltan')
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('message')
      error.message.should.eql('The username provided did not match any user in our records')
    }
  })
})

/** TODO => Test 
 * 1. getStudentProfile()
 * 2. checkTimeLimits()
 */
