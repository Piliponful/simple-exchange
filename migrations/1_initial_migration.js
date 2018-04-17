const Migrations = artifacts.require('Migrations')
console.log('Migrations', Migrations)

module.exports = deployer => {
  deployer.deploy(Migrations)
}
