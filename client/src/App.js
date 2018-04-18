import React from 'react'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import contract from 'truffle-contract'
import Web3 from 'web3'

const SimpleExchange = require('../../build/contracts/simpleExchange.json')

const buildContract = contractI => {
  const smartContract = contract(contractI)
  contract.setProvider(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  return fixTruffleContractCompatibilityIssue(smartContract)
}

const fixTruffleContractCompatibilityIssue = (contract) => {
  if (typeof contract.currentProvider.sendAsync !== 'function') {
    contract.currentProvider.sendAsync = () => {
      return contract.currentProvider.send.apply(
        contract.currentProvider, arguments
      )
    }
  }
  return contract
}

const simpleExchange = buildContract(SimpleExchange)

const buy = () => {
  simpleExchange.deployed().then(instance => {
    instance.createOrder('BTC', 'USD', 2000).send().then(res => {
      console.log(res)
    })
  })
}

export default () => (
  <div>
    <TextField
      hintText='Input amount'
    /><br />
    <FlatButton label='Buy' primary onClick={buy} />
    <FlatButton label='Sell' primary />
  </div>
)
