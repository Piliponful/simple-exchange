// const TestOraclize = artifacts.require('ExampleContract')

// module.exports = deployer => {
//   deployer.deploy(TestOraclize)
// }

const Token = artifacts.require('Token')
const Exhcange = artifacts.require('simpleExchange')

module.exports = deployer => {
  return deployer.deploy(Token, 'BTC', 'Bitcoin')
    .then(() => {
      console.log('TOKEN 1 ADDRESS: ', Token.address)
      const token1Addr = Token.address
      return deployer.deploy(Token, 'USD', 'United Stated Dollar')
        .then(() => {
          const token2Addr = Token.address
          console.log('TOKEN 2 ADDRESS: ', Token.address)
          return deployer.deploy(Exhcange, token1Addr, token2Addr, 2)
            .then(args => { console.log('ARGS: ', args) })
        })
    })
}
