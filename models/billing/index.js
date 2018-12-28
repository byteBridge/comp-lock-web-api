const axios = require("axios");
const knex = require("../../database");

module.exports = class MockBillingServer {


  /**
   * Initiate a subscription transaction. This will show an ecocash prompt to pay.
   */
  async initiateSubscription({
    products,
    authemail,
    mobileNumber,
    mobileMoneyProvider,
    reference,
    subscriptionDuration = 1
  }) {

    // Save the transaction to a local database, so that it can be used to ping
    // products will be a JSON datatype in the table
    await knex("transactions").insert({
        products: JSON.stringify(products),
        authemail,
        mobileNumber,
        status: "created",
        mobileMoneyProvider,
        reference
    });

    const response = await axios.post(
      "http://paynow.now.sh/pay/mobile",
      {
        products,
        authemail,
        mobileNumber,
        mobileMoneyProvider,
        subscriptionDuration,
        reference
      }
    );
    
    // Will have the insctructions on how to proceed with the payment.
    return response.data
  }

  /**
   * Get the last transaction for purposes of pinging the server
   */
  async getLastTransaction () {
    return knex
      .select('*')
      .from("transactions")
      .orderBy('created_at', 'desc')
      .limit(1)
  }

  /**
   * Update the status of the last transaction to paid
   */
  async updateTransactionStatus (reference = '') {
    return knex("transactions")
      .where({ reference })
      .update({ status: 'paid' })
  }

  /**
   * Check the remote server if the payment was made
   */
  async pingSubscription(reference) {
    return (await axios.get(
      "http://paynow.now.sh/complock/ping-subscription/" + reference
    )).data;
  }

  /**
   * Retrieve all the tokens that will activate the computers.
   * Only available once the transactions has been paid
   */
  async getComputerTokens(reference) {
    const response = (await axios.get('http://paynow.now.sh/complock/tokens/' + reference)).data;
    return response;
  }

  /**
   * Once you get the tokens, save them to the database so that the desktop client can check if
   * the computer it is hosted on is paid for.
   */
  async saveComputerTokens(tokens) {
    // find a way to update multiple documents simultaneously
    // for now just have multiple promises doing the job
    const saveTokensPromises = tokens.map(t =>
      knex("computers")
        .where("name", "=", t.computer_name)
        .update({
          'activation_token': t.activation_token,
          'is_paid_for': true,
          'token_expiry_time': new Date(t.token_expiry_time),
          'token_paid_time': new Date(t.token_paid_time)
        })
    );

    return await Promise.all(saveTokensPromises);
  }
};
