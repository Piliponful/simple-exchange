import React from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Snackbar from 'material-ui/Snackbar'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import styles from './App.css'

require('babel-core/register')
require('babel-polyfill')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const accounts = require('../../accounts.json')

const SimpleExchange = require('../../build/contracts/simpleExchange.json')
const BTC = require('../../build/contracts/BTC.json')
const USD = require('../../build/contracts/USD.json')

const buildContract = contractI => {
  const smartContract = contract(contractI)
  smartContract.setProvider(web3.currentProvider)
  if (typeof smartContract.currentProvider.sendAsync !== 'function') {
    smartContract.currentProvider.sendAsync = function () {
      return smartContract.currentProvider.send.apply(
        smartContract.currentProvider, arguments
      )
    }
  }
  return smartContract
}

const simpleExchange = buildContract(SimpleExchange)
const btc = buildContract(BTC)
const usd = buildContract(USD)

const deploy = async () => {
  const simpleExchangeInstance = await simpleExchange.deployed()
  const btcD = await btc.deployed()
  const usdD = await usd.deployed()

  const exchangeBTCBal = await withDecimalPlaces(3000, btcD, true)
  await btcD.transfer(simpleExchangeInstance.address, exchangeBTCBal, { from: accounts[0] })
  const exchangeBTCRealBal = await btcD.balanceOf(simpleExchangeInstance.address)
  console.log('exhcangeBTCBalance: ', exchangeBTCRealBal.toNumber())

  const acc1BTCBal = await withDecimalPlaces(300, btcD, true)
  await btcD.transfer(accounts[1], acc1BTCBal, { from: accounts[0] })
  const acc1BTCRealBal = await btcD.balanceOf(accounts[1])
  console.log('acc1BTCBalance: ', acc1BTCRealBal.toNumber())

  const exchangeUSDBal = await withDecimalPlaces(3000, usdD, true)
  await usdD.transfer(simpleExchangeInstance.address, exchangeUSDBal, { from: accounts[0] })
  const exchangeUSDBalReal = await usdD.balanceOf(simpleExchangeInstance.address)
  console.log('exchangeUSDBalance: ', exchangeUSDBalReal.toNumber())

  const acc1USDBal = await withDecimalPlaces(300, usdD, true)
  await usdD.transfer(accounts[2], acc1USDBal, { from: accounts[0] })
  const acc1USDRealBal = await usdD.balanceOf(accounts[2])
  console.log('acc1USDBalance: ', acc1USDRealBal.toNumber())
}
deploy()

// INFO:
// accounts[1] - BTC
// accounts[2] - USD
const withDecimalPlaces = async (amount, token, addDecimals) => {
  const decimals = await token.decimals()
  return addDecimals ? amount * (Math.pow(10, decimals.toNumber())) : amount / (Math.pow(10, decimals.toNumber()))
}

const buy = async () => {
  const exchange = await simpleExchange.deployed()
  const btcD = await btc.deployed()
  const usdD = await usd.deployed()
  const amount = await withDecimalPlaces(1, btcD, true)
  await exchange.createOrder('BTC', 'USD', amount, { from: accounts[1], gas: 3000000 })
  exchange.allEvents(async (err, e) => {
    if (err) {
      console.error(err)
      throw err
    }
    if (e.event === 'NewOrder' && e.args.account === accounts[1].toLowerCase()) {
      const order = await exchange.getOrder(e.args.orderId)
      console.log('Order: ', order)

      await btcD.approve(exchange.address, order[5].toNumber(), { from: accounts[1] })
      const allowance = await btcD.allowance(accounts[1], exchange.address)
      console.log('Allowance: ', allowance.toNumber())

      const acc1BTCbalBefore = await btcD.balanceOf(accounts[1])
      console.log('Account 1 BTC Balance before exchange: ', acc1BTCbalBefore.toNumber())

      const acc1USDBalBefore = await usdD.balanceOf(accounts[1])
      console.log('Account 1 USD Balance before exchange: ', acc1USDBalBefore.toNumber())

      const executeRes = await exchange.executeOrder(e.args.orderId.toNumber(), { from: accounts[1], gas: 3000000 })
      console.log(executeRes)

      const acc1BTCbalAfter = await btcD.balanceOf(accounts[1])
      console.log('Account 1 BTC Balance before exchange: ', acc1BTCbalAfter.toNumber())

      const acc1USDBalAfter = await usdD.balanceOf(accounts[1])
      console.log('Account 1 USD Balance before exchange: ', acc1USDBalAfter.toNumber())
    }
  })
}

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      fee: null,

      fromName: 'BTC',
      toName: 'USD',
      BtcToUsdExchangeRate: 0,
      BtcAmountToExchange: 0,
      UsdAmountToExchange: 0,
      openSnackbar: false,
      snackbarMessage: 'initial message',
      whoAmI: accounts[1]
    }
  }
  // async componentDidMount () {
  // }
  async setFee (amount, token) {
    const btcD = await btc.deployed()
    const usdD = await usd.deployed()
    const exchange = await simpleExchange.deployed()
    const amountWithZeros = await withDecimalPlaces(amount, token === 'Btc' ? btcD : usdD)
    const feeInPercentage = (await exchange.fee()).toNumber()
    console.log('Fee In Percentage: ', feeInPercentage)
    const fee = await (this.state.fromName ? exchange.getFee(amountWithZeros, feeInPercentage) : exchange.getFee(amountWithZeros, feeInPercentage))

    this.setState({
      fee
    })
  }
  async createOrder (amount) {
    const exchange = await simpleExchange.deployed()
    const btcD = await btc.deployed()
    const amountWithZeros = await withDecimalPlaces(amount, btcD, true)
    try {
      await exchange.createOrder('BTC', 'USD', amountWithZeros, { from: accounts[1], gas: 3000000 })
      this.setState({ snackbarMessage: 'The order is sucessfully created!', openSnackbar: true })
    } catch (e) {
      this.setState({ snackbarMessage: e.message, openSnackbar: true })
    }
  }

  tryExecuteOrder () {

  }

  handleSnackbarClose () {
    this.setState({
      openSnackbar: false
    })
  }

  handleAccountChange (e, i, v) {
    this.setState({
      whoAmI: accounts[v],
      accountIndex: v
    })
  }

  handleAmountChange (token) {
    return e => {
      this.setState({ ...this.state, [token + 'AmountToExchange']: parseFloat(e.target.value) })
      this.setFee(e.target.value, token)
    }
  }

  render () {
    return (
      <div>
        <div className={styles.accountChoiseContainer}>
          <SelectField
            floatingLabelText='Choose your account'
            value={this.state.accountIndex}
            onChange={this.handleAccountChange}
          >
            <MenuItem value={1} primaryText='Man with bitcoins' />
            <MenuItem value={2} primaryText='Man with usd' />
          </SelectField>
        </div>

        <div className={styles.inputsContainer}>
          <Paper className={styles.amountInputContainer} zDepth={1}>
            <label className={styles.labelForInput}>I give</label>
            <TextField hintText='Input amount Of BTC' onChange={this.handleAmountChange('Btc')} />
          </Paper>
          <Paper className={styles.amountInputContainer} zDepth={1}>
            <label className={styles.labelForInput}>I get</label>
            <TextField hintText='Input amount of USD' onChange={this.handleAmountChange('Usd')} />
          </Paper>
          <small>System Comission: {this.state.fee}</small>
        </div>
        <div className={styles.changeButtonContainer}>
          <RaisedButton label='Change' primary />
        </div>

        <Snackbar
          open={this.state.openSnackbar}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose}
        />
      </div>
    )
  }
}
