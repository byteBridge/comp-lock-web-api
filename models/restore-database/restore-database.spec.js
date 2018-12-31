require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const knex = require('../../database')
const { startServer } = require('../../test')

describe('login', () => {
  let server
  const restoreDatabaseUrl = '/restore-database'

  before(done => {
    startServer(runningServer => { 
      server = runningServer
      done()
    })
  })

  after(async () => {
    await server.close()
  })

  beforeEach(async () =>  await knex.migrate.rollback())

  afterEach(async () =>  await knex.migrate.rollback())
  
  describe('POST /restore-database', () => {
    it('should should correctly apply migrations', done => {
      chai.request(server)
        .post(restoreDatabaseUrl)
        .end((err, res) => {
          should.not.exist(err)
          res.redirects.length.should.eql(0)
          res.status.should.eql(200)
          res.type.should.eql('application/json')

          res.body.should.contain.keys('message')
          res.body.message.should.eql('Successfully applied the database migrations')
          done()
        })
    })

    it('should should not apply migrations when one has been applied', done => {
      knex.migrate.latest()
        .then(() => {
          chai.request(server)
            .post(restoreDatabaseUrl)
            .end((err, res) => {
              should.not.exist(err)
              res.redirects.length.should.eql(0)
              res.status.should.eql(200)
              res.type.should.eql('application/json')

              res.body.should.contain.keys('message')
              res.body.message.should.eql('Database is already upto-date')
              done()
            })
        })
        
        .catch(() => done())
    })
  })
})