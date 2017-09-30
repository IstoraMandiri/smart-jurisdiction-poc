var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  if (process.argv[3] === 'test') { return null; }
  deployer.deploy(Migrations);
};
