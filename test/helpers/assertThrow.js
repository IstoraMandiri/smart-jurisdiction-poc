const assertJump = require('zeppelin-solidity/test/helpers/assertJump');

module.exports = async function (test) {
  try {
    await test();
    assert.fail('did not throw');
  } catch (e) {
    assertJump(e);
  };
}
