const BTC = artifacts.require('BTC')
const USD = artifacts.require('USD')
const accounts = require('../accounts.json')

module.exports = async deployer => {
  deployer.deploy(BTC, 'BTC', 'Bitcoin', 10, accounts[1], { from: accounts[0] })
    .then(function() {
      return deployer.deploy(USD, 'USD', 'United Stated Dollar', 10, accounts[2], { from: accounts[0] })
    })
}
