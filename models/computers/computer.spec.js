require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const Computer =  require('./')
const knex = require('../../database')

describe('#Computer.create()', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())
  let newComputer = {
    name: 'Computer10'
  }

  it('should successfully create a new computer', async () => {
    const computerApi = new Computer()
    const createdComputer = await computerApi.create(newComputer)
    createdComputer.should.be.a('object')
    createdComputer.should.contain.keys(...Object.keys(newComputer), 'created_at')
  })

  it('should fail if the computer already exists', async () => {
    const computerApi = new Computer()
    let computerInDb = Object.assign({}, newComputer)
    computerInDb.name = 'computer1'
    try {
      const createdComputer = await computerApi.create(computerInDb)
    } catch (error) {
      should.exist(error)
      error.message.should.eql('Computer already exists in the database')
    }

  })

  it('should fail if the computer name is not provided', async () => {
    let errorMessages = ['"name" is not allowed to be empty']
    await failToCreateWithMissingValue(newComputer, 'name', ...errorMessages)
  })

  /* ======================================= MISSING KEYS =========================================== */
  it('should fail if the name key is not provided', async () => {
    let errorMessages = ['"name" is required']
    await failToCreateWithMissingKey(newComputer, 'name', ...errorMessages)
  })

  it('should get all the computers correctly', async () => {
    const computerApi = new Computer()
    const computers = await computerApi.getAllComputers()
    computers.should.be.an('array')
    computers[0].should.be.a('object')
    computers[0].should.contain.keys('name', 'status', 'username', 'login_date', 'login_time', 'created_at')
  })
  /**
   * @description This function is intended to attemp to create a Computer with all keys (fields) but having some keys with no values
   * @param {*} newComputer The Computer to be created. Ideal with all the required key fields
   * @param {*} value The key (field) of the newComputer object that is to be made empty
   * @param {*} errorMessages A list of error messages resulting from joi validations
   */
  async function failToCreateWithMissingValue (newComputer, value, ...errorMessages) {
    const computerApi = new Computer()
    let computerWithoutValue = Object.assign({}, newComputer)
    computerWithoutValue[value] = ''
    try {
      const createdComputer = await computerApi.create(computerWithoutValue)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }

  /**
   * @description This function is intended to attemp to create a computer with missing keys (fields)
   * @param {*} newComputer The Computer to be created. Ideal with all the required key fields
   * @param {*} key The key (field) of the newComputer object that is to be deleted
   * @param {*} errorMessages A list of error messages resulting from joi validations
   */
  async function failToCreateWithMissingKey (newComputer, key, ...errorMessages) {
    const computerApi = new Computer()
    let computerWithoutKey = Object.assign({}, newComputer)
    delete computerWithoutKey[key]
    try {
      const createdComputer = await computerApi.create(computerWithoutKey)
    } catch (error) {
      should.exist(error)
      errorMessages.forEach(message => {
        error.message.should.eql('Validation errors occured')
        error.errors.find(e => e.message == message).message.should.eql(message)
      })
    }
  }
})

describe('#Computer.deactivate', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())

  it('should successfully block a compouter', async () => {
    const computerApi = new Computer()
    const response = await computerApi.deactivate({ name: 'computer1' })
    response.should.be.an('object')
    response.should.contain.keys('message')
  })
})

describe('#Computer.reactivate', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())

  it('should successfully un block a compouter', async () => {
    const computerApi = new Computer()
    const response = await computerApi.reactivate({ name: 'computer1' })
    response.should.be.an('object')
    response.should.contain.keys('message')
  })
})

describe('#Computer.unregister', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())

  it('should successfully unregister a compouter', async () => {
    const computerApi = new Computer()
    const response = await computerApi.unregister({ name: 'computer1' })
    response.should.be.an('object')
    response.should.contain.keys('message')
  })
})
