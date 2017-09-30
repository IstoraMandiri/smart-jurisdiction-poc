const Whitelist = artifacts.require('./Whitelist.sol');
const assertThrow = require('./helpers/assertThrow');

contract('Whitelist', function (addresses) {
  let whitelist
  before(async function () {
    whitelist = await Whitelist.new();
  })
  describe('set / get', function () {
    it('returns false for undefined values', async function () {
      assert.equal(await whitelist.get.call(addresses[1]), false);
      assert.equal(await whitelist.get.call(addresses[2]), false);
    });
    it('allows the owner to update it', async function () {
      assert.ok(await whitelist.set(addresses[1], true));
      assert.ok(await whitelist.set(addresses[2], true));
      assert.equal(await whitelist.get.call(addresses[1]), true);
      assert.equal(await whitelist.get.call(addresses[2]), true);
    });
    it('allows the owner to update already set value', async function () {
      assert.ok(await whitelist.set(addresses[1], false));
      assert.equal(await whitelist.get.call(addresses[1]), false);
    });
    it('throws when being set by a non-owner', async function () {
      await assertThrow(() => whitelist.set(addresses[1], false, { from: addresses[1] }));
    });
  });
})
