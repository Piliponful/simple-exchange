import React from 'react'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import Web3 from 'web3'
import contract from 'truffle-contract'

// Step 1: Get a contract into my application
const json = require('../../build/contracts/simpleExchange.json')

// Step 2: Turn that contract into an abstraction I can use
const simpleExchange = contract(json)

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
web3.eth.getAccounts()
  .then(accounts => {
    var myContract = new web3.eth.Contract(json.abi, json.networks['1337'].address, {
      from: accounts[0],
      gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case
      data: json.bytecode
    });
    console.log(myContract.methods)
    // myContract.methods.setPrice(12).send({ from: '0x1edc0b1f64ac26adc050369a3c335015544c4fa2', value: 0 }).then(() => {
      myContract.methods.setTest(12).send().then(() => {
        myContract.methods.getTest().call().then(console.log)
      })
    // })
    // console.log(myContract.events)
    // myContract.events.allEvents((err, events) => { console.log(err, events) })
  })

const buy = () => {
  simpleExchange.deployed().then(instance => {
    console.log(instance)
    instance.allEvents({}, (a, b) => console.log(a, b))
    const a = instance.update({ from: acc, gas: 3000000, value: 300000 })
    .then(() => {
      instance.price.call({from: acc}).then(console.log)
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
