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

describe('POST /api/v1/auth/login', () => {
  let server
  const loginUrl ='/api/v1/auth/login'

  const studentUser = {
    username: 'garikai',
    password: 'rodneygg',
  }

  const adminUser = {
    username: 'tinaye',
    password: 'makonese',
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

  afterEach(async () => await knex.migrate.rollback())
  it('should login a student from the web', async () => {
    chai.request(server)
      .post(loginUrl)
      .send(studentUser)
      .end((err, res) => {
        should.not.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(200)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('token', 'message', 'user')
        res.body.token.should.be.a('string')
        res.body.message.should.eql('success')
        const userKeys = [ 'username', 'f_name', 's_name', 'type', 'blocked', 'login_time', 'time_limit', 'remaining_time', 'used_time']
      })
  })
  it('should login a user (student) with success from desktop', async () => {
    const user = {
      username: 'garikai',
      password: 'rodneygg'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .query({
        app: 'desktop',
        computer_name: 'computer1'
      })
      .end((err, res) => {
        should.not.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(200)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('token', 'message', 'user')
        res.body.token.should.be.a('string')
        res.body.message.should.eql('success')
        const userKeys = [ 'username', 'f_name', 's_name', 'type', 'blocked', 'login_time', 'time_limit', 'remaining_time', 'used_time']
        res.body.user.should.contain.keys(...userKeys)
        res.body.user.should.not.contain.keys('password')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should login a user (student) with success from web', async () => {
    const user = {
      username: 'garikai',
      password: 'rodneygg'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.not.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(200)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('token', 'message', 'user')
        res.body.token.should.be.a('string')
        res.body.message.should.eql('success')
        const userKeys = [ 'username', 'f_name', 's_name', 'type', 'blocked']
        res.body.user.should.contain.keys(...userKeys)
        res.body.user.should.not.contain.keys('password')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should login a user (administrator) with success', async () => {
    const user = {
      username: 'kudakwashe',
      password: 'paradzayi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.not.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(200)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('token', 'message', 'user')
        res.body.token.should.be.a('string')
        res.body.message.should.eql('success')
        const userKeys = [ 'username', 'f_name', 's_name', 'type', 'blocked', 'login_time', 'time_limit']
        res.body.user.should.contain.keys(...userKeys)
        res.body.user.should.not.contain.keys('password')
        
        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when a user suplies invalid username', async () => {
    const user = {
      username: 'tinashe',
      password: 'paradzayi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(401)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql('invalid login details')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when a user suplies an invalid password', async () => {
    const user = {
      username: 'kudakwashe',
      password: 'wrong_pass'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(401)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql('invalid login details')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when a user suplies an invalid username and password', async () => {
    const user = {
      username: 'wrong_user',
      password: 'wrong_pass'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(401)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql('invalid login details')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when a user suplies an empty username', async () => {
    const user = {
      username: '',
      password: 'paradzayi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(400)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql("\"username\" is not allowed to be empty")

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when a user suplies an empty password', async () => {
    const user = {
      username: 'kudakwashe',
      password: ''
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(400)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql("\"password\" is not allowed to be empty")

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when no username param is provided', async () => {
    const user = {
      password: 'paradzayi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(400)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql("\"username\" is required")

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail when no password param is provided', async () => {
    const user = {
      username: 'kudakwashe'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(400)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql("\"password\" is required")

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })

  it('should fail if the api is called by the desktop but computer_name not provide', async () => {
    const user = {
      username: 'kudakwashe',
      password: 'paradzayi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user).query({ 'app': 'desktop'})
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(400)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql('The name of the computer attempting to login has not been provided.')

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
    })
  })

  it('should fail when the user has used up all his/her allocated time', async () => {
    const user = {
      username: 'denzel',
      password: 'makombeshushi'
    }

    chai.request(server)
      .post(loginUrl)     
      .send(user)
      .query({ computer_name: 'computer1' })
      .end((err, res) => {
        should.exist(err)
        res.redirects.length.should.eql(0)
        res.status.should.eql(401)
        res.type.should.eql('application/json')
        res.body.should.contain.keys('message')
        res.body.message.should.eql("We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.")

        // test for appropriate headers
        should.exist(res.header['cache-control'])
        should.exist(res.header['pragma'])
        res.header['cache-control'].should.eql('no-store')
        res.header['pragma'].should.eql('no-store')
        
      })
  })
})
