const TokenTemplate = artifacts.require('./TokenTemplate.sol');
const Whitelist = artifacts.require('./Whitelist.sol');

const assertThrow = require('./helpers/assertThrow');

const bn = web3.toBigNumber;

contract('TokenTemplate', function ([owner, trader1, trader2]) {
  let tokenTemplate;
  let whitelist;
  before(async function () {
    tokenTemplate = await TokenTemplate.new();
    whitelist = await Whitelist.new();
    tokenTemplate.registerWhitelist('trader', whitelist.address);
    await whitelist.set(trader1, true);
    await whitelist.set(trader2, true);
    await tokenTemplate.mint(trader1, 100);
  });
  describe('transfer', function () {
    it('transfrers from trader to trader', async function () {
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), 'initial');
      await tokenTemplate.transfer(trader2, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transfer(trader1, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
    it('throws if the contract is paused', async function () {
      await tokenTemplate.pause();
      await assertThrow(() => tokenTemplate.transfer(trader2, 10, { from: trader1 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0));
    });
    it('transfrers after being unpaused', async function () {
      await tokenTemplate.unpause();
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), 'initial');
      await tokenTemplate.transfer(trader2, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transfer(trader1, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
    it('throws when sending to a non-trader', async function () {
      await assertThrow(() => tokenTemplate.transfer(owner, 10, { from: trader1 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(owner), bn(0));
    });
    it('throws when sending from a non-trader', async function () {
      await whitelist.set(trader1, false);
      await assertThrow(() => tokenTemplate.transfer(trader2, 10, { from: trader1 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0));
    });
    it('transfers when a trader is re-whitelisted', async function () {
      await whitelist.set(trader1, true);
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), 'initial');
      await tokenTemplate.transfer(trader2, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transfer(trader1, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
  });
  describe('approve', function () {
    it('allows setting allowance', async function () {
      assert.deepEqual(await tokenTemplate.allowance(trader1, trader2), bn(0), 'initial (1)');
      assert.deepEqual(await tokenTemplate.allowance(trader2, trader1), bn(0), 'initial (2)');
      await tokenTemplate.approve(trader2, 200, { from: trader1 });
      assert.deepEqual(await tokenTemplate.allowance(trader1, trader2), bn(200), 'after (1)');
      await tokenTemplate.approve(trader1, 200, { from: trader2 });
      assert.deepEqual(await tokenTemplate.allowance(trader2, trader1), bn(200), 'after (2)');
    });
    it('throws if the contract is paused', async function () {
      await tokenTemplate.pause();
      await assertThrow(() => tokenTemplate.approve(trader2, 100, { from: trader1 }));
      assert.deepEqual(await tokenTemplate.allowance(trader1, trader2), bn(200), 'after (1)');
      await assertThrow(() => tokenTemplate.approve(trader1, 100, { from: trader2 }));
      assert.deepEqual(await tokenTemplate.allowance(trader2, trader1), bn(200), 'after (2)');
    });
    it('allows setting once un-paused', async function () {
      await tokenTemplate.unpause();
      await tokenTemplate.approve(trader2, 100, { from: trader1 });
      assert.deepEqual(await tokenTemplate.allowance(trader1, trader2), bn(100), 'after (1)');
      await tokenTemplate.approve(trader1, 100, { from: trader2 });
      assert.deepEqual(await tokenTemplate.allowance(trader2, trader1), bn(100), 'after (2)');
    });
    it('allows non-whitelisted users to set allowances', async function () {
      await tokenTemplate.approve(trader1, 100, { from: owner });
      assert.deepEqual(await tokenTemplate.allowance(owner, trader1), bn(100));
    });
    it('allows giving allowance to non-whitelisted users', async function () {
      await tokenTemplate.approve(owner, 100, { from: trader1 });
      assert.deepEqual(await tokenTemplate.allowance(trader1, owner), bn(100));
    });
  });
  describe('transferFrom', function () {
    // now, we have allowances set to 100 for traderx:traderx and owner:trader1
    it('transfrers from trader to trader', async function () {
      await tokenTemplate.transferFrom(trader1, trader2, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transferFrom(trader2, trader1, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
    it('throws if the contract is paused', async function () {
      await tokenTemplate.pause();
      await assertThrow(() => tokenTemplate.transferFrom(trader1, trader2, 10, { from: trader2 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0));
    });
    it('transfrers after being unpaused', async function () {
      await tokenTemplate.unpause();
      await tokenTemplate.transferFrom(trader1, trader2, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transferFrom(trader2, trader1, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
    it('throws when sending to a non-trader', async function () {
      await assertThrow(() => tokenTemplate.transferFrom(trader1, owner, 10, { from: trader2 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(owner), bn(0));
    });
    it('throws when sending from a non-trader', async function () {
      await assertThrow(() => tokenTemplate.transferFrom(trader1, trader2, 10, { from: owner }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0));
    });
    it('throws when transferring from a non-trader', async function () {
      await whitelist.set(trader1, false);
      await assertThrow(() => tokenTemplate.transferFrom(trader1, trader2, 10, { from: trader2 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0));
    });
    it('transfers once again when a trader is re-whitelisted', async function () {
      await whitelist.set(trader1, true);
      await tokenTemplate.transferFrom(trader1, trader2, 10, { from: trader2 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(90), '1 -> 2 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(10), '1 -> 2 (2)');
      await tokenTemplate.transferFrom(trader2, trader1, 10, { from: trader1 });
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), '2 -> 1 (1)');
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader2), bn(0), '2 -> 1 (2)');
    });
  });

  describe('overrideBalance', function () {
    it('allows admins to override any balance', async function () {
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(100), 'initial');
      await tokenTemplate.overrideBalance(trader1, 1000);
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(1000), '1');
      await tokenTemplate.overrideBalance(trader1, 0);
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(0), '2');
    });
    it('allows admins to override any balance when paused', async function () {
      await tokenTemplate.pause();
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(0), 'initial');
      await tokenTemplate.overrideBalance(trader1, 1000);
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(1000), '1');
      await tokenTemplate.overrideBalance(trader1, 0);
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(0), '2');
    });
    it('throws when non-admins try to override balances', async function () {
      await tokenTemplate.unpause();
      await assertThrow(() => tokenTemplate.overrideBalance(trader1, 100, { from: trader1 }));
      assert.deepEqual(await tokenTemplate.balanceOf.call(trader1), bn(0));
    });
  });
});
