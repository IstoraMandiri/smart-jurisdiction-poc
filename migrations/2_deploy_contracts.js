const util = require('util');

const ContractFactory = artifacts.require('ContractFactory.sol');
const Whitelist = artifacts.require('Whitelist.sol');

const getAccounts = util.promisify(web3.eth.getAccounts);

module.exports = function deployContracts(deployer) {
  if (process.argv[3] === 'test') { return null; }
  return deployer.deploy(ContractFactory).then(async () => {
    const accounts = await getAccounts();
    const factory = ContractFactory.at(ContractFactory.address);
    const managersWhitelist = await Whitelist.new();
    const tradersWhitelist = await Whitelist.new();
    await factory.configureMaxInitialBalance(1e18);
    await factory.configureTraderWhitelist(tradersWhitelist.address);
    await factory.registerWhitelist('manager', managersWhitelist.address);
    await Promise.all([
      managersWhitelist.set(accounts[1], true),
      tradersWhitelist.set(accounts[1], true),
      tradersWhitelist.set(accounts[2], true),
      tradersWhitelist.set(accounts[3], true),
    ]);
    // TODO add the factory to the jurisdiction (doesnt do much right now)
    // await SmartJurisdiction.set(Factory.address, true);
  });
};
