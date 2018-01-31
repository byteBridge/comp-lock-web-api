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

describe('register a new computer', () => {
  let server
  const registerUrl ='/api/v1/computers/new'
  const getComputersUrl = '/api/v1/computers'
  const deactivateComputersUrl = '/api/v1/deactivate'
  const unregisterComputersUrl = '/api/v1/unregister'

  const computer = {
    name: 'computer10'
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
  
  describe('POST /api/v1/computers/new', () => {
    it('should register a computer', async () => {
      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(computer)
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message', 'computer')
          res.body.message.should.eql('successfully created computer.')
        })
    })

    it('should fail if the computer already exists', async () => {
      // modify the computer object
      const modifiedComputer = Object.assign({}, computer)
      modifiedComputer.name = 'computer1'

      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(modifiedComputer)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(422)
          res.type.should.eql('application/json')
          res.body.message.should.eql('Computer already exists in the database')
        })
    })

    it('should fail to register a computer if the client is not authenticated', async () => {
      chai.request(server)
        .post(registerUrl)
        .send(computer)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(401)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
          res.body.message.should.eql('No token provided.')
        })
    })

    it('should fail to register a computer if the client is a non admin account', async () => {
      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: studentToken })
        .send(computer)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(401)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
          res.body.message.should.eql('Access denied. Login as administrator to continue.')
        })
    })

    it('should fail if the name is not provided', async () => {
      // remove the username
      const modifiedComputer = Object.assign({}, computer)
      modifiedComputer.name = ''

      chai.request(server)
        .post(registerUrl)
        .set({ Authorization: token })
        .send(modifiedComputer)
        .end((err, res) => {
          should.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(400)
          res.type.should.eql('application/json')
          res.body.message.should.eql(`Validation errors occured`)
          const errorMessages = [
            '"name" is not allowed to be empty'
          ]
          for(let i = 0; i < errorMessages.length; i++) {
            res.body.error.errors.find(e => e.message == errorMessages[i]).message.should.eql(errorMessages[i])
          }
        })
    })

  })

  describe('GET /api/v1/computers', () => {
    it('should get all the computers correctly', async () => {
      chai.request(server)
        .get(getComputersUrl)
        .set({ Authorization: token })
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.computers.should.be.an('array')
          res.body.computers[0].should.be.a('object')
          res.body.computers[0].should.contain.keys('name', 'status', 'username', 'login_date', 'login_time', 'created_at')
        })
    })
  })
  describe('PUT /api/v1/computers/deactivate', () => {
    it('should deactive a specified computer', async () => {
      chai.request(server)
        .put(deactivateComputersUrl)
        .set({ Authorization: token })
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
        })
    })
  })

  describe('DELETE /api/v1/computers/unregister', () => {
    it('should unregister a specified computer', async () => {
      chai.request(server)
        .put(unregisterComputersUrl)
        .set({ Authorization: token })
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')
          res.body.should.contain.keys('message')
        })
    })
  })
})