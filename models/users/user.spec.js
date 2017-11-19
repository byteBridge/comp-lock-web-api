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
    const createdUser = await User.create(newUser)
    createdUser.should.be.a('object')
    createdUser.should.contain.keys(...Object.keys(newUser), 'created_at', 'updated_at')
  })

  it('should fail if the user already exists', async () => {
    let userInDb = Object.assign({}, newUser)
    userInDb.username = 'kudakwashe'
    try {
      const createdUser = await User.create(userInDb)
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
    let userWithoutValue = Object.assign({}, newUser)
    userWithoutValue[value] = ''
    try {
      const createdUser = await User.create(userWithoutValue)
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
    let userWithoutKey = Object.assign({}, newUser)
    delete userWithoutKey[key]
    try {
      const createdUser = await User.create(userWithoutKey)
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
  const studentCredentialsForWeb = { username: 'garikai', password: 'rodneygg' }

  it('should login an administrator', async () => {
      const authUser = await User.login(adminCredentials)
      should.exist(authUser)
      authUser.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at'])
      authUser.should.not.contain.keys('password')
  })


  it('should log in a student from the web ui', async () => {
    const response = await User.login(studentCredentialsForWeb)
    should.exist(response)
    response.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at', 'computer_name', 'time_limit'])
    response.should.not.contain.keys('password')
  })

  it('should log in a student from the desktop', async () => {
      const response = await User.login(studentCredentialsForDesktop)
      should.exist(response)
      response.should.contain.keys(...['token', 'username', 'f_name', 's_name', 'type', 'gender', 'email', 'blocked', 'created_at', 'updated_at', 'computer_name', 'login_time', 'remaining_time', 'time_limit', 'used_time'])
      response.should.not.contain.keys('password')
  })

  it('should not log in a student from the desktop who has used time', async () => {
    try {
      await User.login(studentCredentialsForDesktopTimeUp)
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
    try {
      await User.login(studentCredentialsForDesktopBlocked)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`We regret to inform you that your account qualifies to be blocked. Report by the librarian's desk to have it unblocked`)
    }
  })

  it('should not log in a student from the desktop when his/her account is online on another computer', async () => {
    try {
      await User.login(studentCredentialsForDesktop)
      await User.login(studentCredentialsForDesktop)
    } catch (error) {
      should.exist(error)
      error.should.contain.keys('status', 'message')
      error.status.should.eql(401)
      error.message.should.eql(`Your account is already signed in on computer: ${studentCredentialsForDesktop.computer_name}`)
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
    credentialsWithoutValue[key] = ''
    try {
      await User.login(credentialsWithoutValue)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }

})