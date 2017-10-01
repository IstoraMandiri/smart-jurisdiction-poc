const TestHasWhitelists = artifacts.require('./TestHasWhitelists.sol');
const Whitelist = artifacts.require('./Whitelist.sol');

const assertThrow = require('./helpers/assertThrow');

contract('HasWhitelists', function (addresses) {
  let hasWhitelists;
  let whitelist;
  before(async function () {
    hasWhitelists = await TestHasWhitelists.new();
    whitelist = await Whitelist.new();
    hasWhitelists.registerWhitelist('test2', whitelist.address);
    await whitelist.set(addresses[0], true);
    await whitelist.set(addresses[1], false);
  });
  describe('registerWhitelist', function () {
    it('registers a whitelist address', async function () {
      await hasWhitelists.registerWhitelist('test', whitelist.address);
      assert.equal(await hasWhitelists.whitelists.call('test'), whitelist.address);
    });
  });
  describe('getWhitelisted', function () {
    it('returns true for whitelisted users', async function () {
      assert.equal(await hasWhitelists.getWhitelisted.call('test', addresses[0]), true);
    });
    it('returns false for unwhitelisted users', async function () {
      assert.equal(await hasWhitelists.getWhitelisted.call('test', addresses[1]), false);
    });
    it('returns false for unset users', async function () {
      assert.equal(await hasWhitelists.getWhitelisted.call('test', addresses[2]), false);
    });
    it('throws unregistered whitelists', async function () {
      await assertThrow(() => hasWhitelists.getWhitelisted.call('unregisted', addresses[0]));
    });
  });
  describe('isWhitelisted', function () {
    it('does not throw for whitelisted users', async function () {
      assert.equal(await hasWhitelists.testIsWhitelisted.call('test', addresses[0]), true);
    });
    it('throws for unwhitelisted users', async function () {
      await assertThrow(() => hasWhitelists.testIsWhitelisted.call('test', addresses[1]));
    });
    it('throws for unset users', async function () {
      await assertThrow(() => hasWhitelists.testIsWhitelisted.call('test', addresses[2]));
    });
    it('throws unregistered whitelists', async function () {
      await assertThrow(() => hasWhitelists.testIsWhitelisted.call('unregisted', addresses[0]));
    });
  });
});
