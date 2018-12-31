const BillingModel = require('./')
const uuidv4 = require('uuid/v4')
const { buildResponse } = require('../../utils/responseService')


/**
 * The librarian clicks the pay button, after selecting the computers s/he wants
 * This asyncronously starts the payment process. A USSD promt is sent to the user
 * to pay using ecocash.
 */
exports.initiateSubscription = async function (req, res) {
  const billing = new BillingModel()
  const { products, authemail, mobileNumber, mobileMoneyProvider, reference = uuidv4() } = req.body
  
  const response = await billing.initiateSubscription({
    products, authemail, mobileNumber, mobileMoneyProvider, reference
  })

  buildResponse(res, 200, response)
}

/**
 * The response from the initiateSubscription will contain the reference of the subscription
 * and we can ping our server to check if the payment has been made.
 * Once the payment is made paynow will tell our server and it will generate the tokens for the computers and saves them.
 * A tokenUrl will be provided to  allow us to get the tokens
 */
exports.pingSubscription = async function (req, res) {
  const billing = new BillingModel()
  const { reference } = req.params
  const response = await billing.pingSubscription(reference)

  if (response && response.status == 'paid') {
    await billing.saveComputerTokens(response.tokens)
    await billing.updateTransactionStatus(reference)

    return buildResponse(
      res,
      200,
      {
        message: `Successfully recieved payment. Renewed subscriptions for ${response.tokens.length} computers.`,
        tokens: response.tokens,
        status: 'paid'
      }
      )
    }

    buildResponse(res, 200, {
      message: response.message,
      status: response.status
    })
  }
  
  /**
   * If the user leaves the billing page soon after initiating a transaction we have to get the last
   * Initiated transaction. If the transaction is < 5 min old the UI should disable the pay button
   * If the transaction is > 5 minutes and still not paid delete it from the database.
   */
  exports.getLastTransaction = async function (res, res) {
    const billing = new BillingModel()
    let response = await billing.getLastTransaction()
    if (response.length > 0) {
      response = response[0]
    } else {
      response = null
    }
    buildResponse(res, 200, response)
  }