console.log('HERE')
const Token = artifacts.require('TravelCoin')
console.log('Token', Token)

module.exports = deployer => {
  deployer.deploy(Token, 'BTC')
  deployer.deploy(Token, 'USD')
}
