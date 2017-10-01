const ContractFactory = artifacts.require('./ContractFactory.sol');
const Whitelist = artifacts.require('./Whitelist.sol');
const TokenTemplate = artifacts.require('./TokenTemplate.sol');

const assertThrow = require('./helpers/assertThrow');

contract('ContractFactory', function ([owner, manager, trader]) {
  let factory;
  let managerWhitelist;
  let traderWhitelist;
  before(async function () {
    factory = await ContractFactory.new();
    managerWhitelist = await Whitelist.new();
    traderWhitelist = await Whitelist.new();
    factory.registerWhitelist('manager', managerWhitelist.address);
    await managerWhitelist.set(manager, true);
    await traderWhitelist.set(manager, true);
    await traderWhitelist.set(trader, true);
  });
  describe('configureMaxInitialBalance', function () {
    it('can be set by the owner', async function () {
      await factory.configureMaxInitialBalance(20);
      assert.equal(await factory.maxInitialBalance.call(), 20);
    });
    it('throws when configured by non-owner', async function () {
      await assertThrow(() => factory.configureMaxInitialBalance(22, { from: manager }));
      assert.equal(await factory.maxInitialBalance.call(), 20);
    });
  });
  describe('conigureTraderWhitelist', function () {
    it('can be set by the owner', async function () {
      await factory.configureTraderWhitelist(traderWhitelist.address);
      assert.equal(await factory.traderWhitelist.call(), traderWhitelist.address);
    });
    it('throws when configured by non-owner', async function () {
      await assertThrow(() => factory.configureTraderWhitelist(manager, { from: manager }));
      assert.equal(await factory.traderWhitelist.call(), traderWhitelist.address);
    });
  });
  describe('deploy', function () {
    it('deploys a new contract instance with correct values', async function () {
      const { logs } = await factory.deploy(10, { from: manager });
      const token = TokenTemplate.at(logs[1].args._contract);
      assert.equal(await factory.deployments.call(token.address), manager);
      assert.equal(await token.owner.call(), owner);
      assert.equal(await token.balanceOf.call(manager), 10);
      assert.equal(await token.mintingFinished.call(), true);
    });
    it('throws if initialValue is too high', async function () {
      await assertThrow(() => factory.deploy(21, { from: manager }));
    });
    it('throws if deployed from a non-manager', async function () {
      await assertThrow(() => factory.deploy(10));
    });
  });
});
