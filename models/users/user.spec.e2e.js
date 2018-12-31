require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const knex = require('../../database')
const { startServer } = require('../../test')
const { generateToken } = require('../../utils/authService')

// admin token
const token = generateToken({
  username: 'kudakwashe',
  type: 'administrator',
  exp: require('moment')().add(7, 'd').unix()
})

// student token
const studentToken =  generateToken({
  username: 'garikai',
  type: 'student',
  exp: require('moment')().add(7, 'd').unix()
})

describe('register a new user', () => {
  let server
  const registerUrl ='/api/v1/users/new'

  const user = {
    username: 'tinaye',
    password: 'makonese',
    type: 'student',
    f_name: 'Tinaye',
    s_name: 'Makonese',
    gender: 'Male',
    email: 'tbagcity@gmail.com'
  }

  before(done => {
    startServer(runningServer => { 
      server = runningServer
      done()
    })
  })

  after(async () => {
    await server.close()
  })

  beforeEach(async () =>  await knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(async () =>  await knex.migrate.rollback())
  
  describe('POST /api/v1/users/new', () => {
    it('should register a user', async () => {
      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(user)
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message', 'user')
          res.body.message.should.eql('successfully created user.')
        })
    })

    it('should fail if the user already exists', async () => {
      // modify the user object
      const modifiedUser = Object.assign({}, user)
      modifiedUser.username = 'kudakwashe'

      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(422)
          res.type.should.eql('application/json')
          res.body.message.should.eql('User already exists in the database')
        })
    })

    it('should fail to register a user if the client is not authenticated', async () => {
      chai.request(server)
        .post(registerUrl)
        .send(user)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(401)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
          res.body.message.should.eql('No token provided.')
        })
    })

    it('should fail to register a user if the client is a non admin account', async () => {
      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: studentToken })
        .send(user)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(401)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
          res.body.message.should.eql('Access denied. Login as administrator to continue.')
        })
    })

    it('should fail if the username is not provided', async () => {
      // remove the username
      const modifiedUser = Object.assign({}, user)
      modifiedUser.username = ''

      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(400)
          res.type.should.eql('application/json')
          res.body.message.should.eql(`Validation errors occured`)
          const errorMessages = [
            '"username" is not allowed to be empty',
            '"username" length must be at least 6 characters long'
          ]
          for(let i = 0; i < errorMessages.length; i++) {
            res.body.error.errors.find(e => e.message == errorMessages[i]).message.should.eql(errorMessages[i])
          }
        })
    })

    it('should fail if the password is not provided', async () => {
      const modifiedUser = Object.assign({}, user)
      modifiedUser.password = ''

      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.type.should.eql('application/json')
          res.status.should.eql(400)
          res.body.message.should.eql(`Validation errors occured`)
          const errorMessages = [
            '"password" is not allowed to be empty',
            '"password" length must be at least 8 characters long'
          ]
          for(let i = 0; i < errorMessages.length; i++) {
            res.body.error.errors.find(e => e.message == errorMessages[i]).message.should.eql(errorMessages[i])
          }
        })
    })
  })
})

/** TODO => Test 
 *  1. {*} /api/v1/users/username/*
 *  2. GET /api/v1/users/online
 *  3. {*} /api/v1/users/timelimits/*
 */