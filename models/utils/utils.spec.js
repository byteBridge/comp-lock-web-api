require('../../config/init').setEnvironment()
process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const Utils =  require('./')
const knex = require('../../database')

describe('#utils.checkTimeUsage()', () => {
  // add up to less than the time limits
  const logsessions = [
    { duration: '00:25:00' },
    { duration: '00:01:00' },
    { duration: '00:02:00' },
  ]
  
  // add up to the time limits
  const timeupLogsessions = [
    { duration: '00:25:00' },
    { duration: '00:01:00' },
    { duration: '00:00:30' },
    { duration: '00:00:30' },
    { duration: '00:03:00' },
  ]
  const timeLimits = '00:30:00'

  it('should show that student still has time', (done) => {
    const response = Utils.checkTimeUsage(logsessions, timeLimits)
    response.should.contain.keys('time_up', 'used_time', 'remaining_time')
    response.time_up.should.be.a('boolean')
    response.time_up.should.eql(false)
    response.used_time.should.be.a('string')
    response.used_time.should.eql('0:28:0')
    response.remaining_time.should.be.a('string')
    response.remaining_time.should.eql('0:2:0')
    done()
  })

  it('should show time up for student who has used up time', (done) => {
    const response = Utils.checkTimeUsage(timeupLogsessions, timeLimits)
    response.should.contain.keys('time_up', 'used_time', 'remaining_time')
    response.time_up.should.be.a('boolean')
    response.time_up.should.eql(true)
    response.used_time.should.be.a('string')
    response.used_time.should.eql('0:30:0')
    response.remaining_time.should.be.a('string')
    response.remaining_time.should.eql('0:0:0')
    done()
  })
})