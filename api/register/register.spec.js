require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const knex = require('../../database')
const { startServer } = require('../../test')
const { generateToken } = require('../../utils/authService')
const token = generateToken({
  username: 'kudakwashe', // the admin account
  exp: require('moment')().add(7, 'd').unix()
})

describe('login', () => {
  let server
  const registerUrl = '/auth/register'

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

  after(done => {
    server.close(done)
  })

  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
  )

  afterEach(() => knex.migrate.rollback())
  
  describe('POST /register', () => {
    it('should register a user', done => {
      chai.request(server)
        .post(registerUrl)
        .query({ token })
        .send(user)
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message', 'user')
          res.body.message.should.eql('successfully created user.')
          done()
        })
    })

    it('should fail if the user already exists', done => {
      // modify the user object
      const modifiedUser = Object.assign({}, user)
      modifiedUser.username = 'kudakwashe'

      chai.request(server)
        .post(registerUrl)
        .query({ token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(422)
          res.type.should.eql('application/json')
          res.body.message.should.eql('user already exists')
          done()
        })
    })

    it('should fail to register a user if the client is not authenticated', done => {
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
          done()
        })
    })

    it('should fail if the username is not provided', done => {
      // remove the username
      const modifiedUser = Object.assign({}, user)
      modifiedUser.username = ''

      chai.request(server)
        .post(registerUrl)
        .query({ token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(400)
          res.type.should.eql('application/json')
          res.body.message.should.eql(`"username" is not allowed to be empty`)
          done()
        })
    })

    it('should fail if the password is not provided', done => {
      const modifiedUser = Object.assign({}, user)
      modifiedUser.password = ''

      chai.request(server)
        .post(registerUrl)
        .query({ token })
        .send(modifiedUser)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.type.should.eql('application/json')
          res.status.should.eql(400)
          res.body.message.should.eql(`"password" is not allowed to be empty`)
          done()
        })
    })
  })
})