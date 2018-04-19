const Exhcange = artifacts.require('simpleExchange')
const BTC = artifacts.require('BTC')
const USD = artifacts.require('USD')

module.exports = deployer => {
  deployer.deploy(Exhcange, BTC.address, USD.address, 2, { value: 9000000 })
}
