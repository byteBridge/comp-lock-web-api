const ComputerModel = require('./')
const { buildResponse } = require('../../utils/responseService')

async function create (req, res) {
  try {
    let newComputer = req.body
    const computerApi = new ComputerModel()
    const createdComputer = await computerApi.create(newComputer)
    buildResponse(res, 200, { message: 'successfully created computer.', computer: createdComputer })
  } catch (error) {
    if (error.status) return buildResponse(res, error.status, { message: error.message, error })
    buildResponse(res, 500, { message: 'something happened', error })
  }
}

async function getAllComputers (req, res) {
  try {
    const computerApi = new ComputerModel()
    const computers = await computerApi.getAllComputers()
    buildResponse(res, 200, { computers })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

async function deactivate (req, res) {
  try {
    let name = req.body.name
    const computerApi = new ComputerModel()
    const response = await computerApi.deactivate({ name })
    buildResponse(res, 200, { message: response.message })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}


async function reactivate (req, res) {
  try {
    let name = req.body.name
    const computerApi = new ComputerModel()
    const response = await computerApi.reactivate({ name })
    buildResponse(res, 200, { message: response.message })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

async function unregister (req, res) {
  try {
    let name = req.body.name
    const computerApi = new ComputerModel()
    const response = await computerApi.unregister({ name })
    buildResponse(res, 200, { message: response.message })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

module.exports = {
  create,
  getAllComputers,
  deactivate,
  reactivate,
  unregister
}