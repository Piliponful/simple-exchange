// const Token = artifacts.require('Token')
// const Exhcange = artifacts.require('simpleExchange')
const oraclizeTest = artifacts.require('KrakenPriceTicker')
// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

module.exports = deployer => {
  deployer.deploy(oraclizeTest)
  // return deployer.deploy(Token, 'BTC', 'Bitcoin')
  //   .then(() => {
  //     console.log('TOKEN 1 ADDRESS: ', Token.address)
  //     const token1Addr = Token.address
  //     return deployer.deploy(Token, 'USD', 'United Stated Dollar')
  //       .then(() => {
  //         const token2Addr = Token.address
  //         console.log('TOKEN 2 ADDRESS: ', Token.address)
  //         return deployer.deploy(Exhcange, token1Addr, token2Addr, 2)
  //           .then(args => { console.log('ARGS: ', args) })
  //       })
  //   })
}
