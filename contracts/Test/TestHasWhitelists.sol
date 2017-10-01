pragma solidity ^0.4.16;

import '../HasWhitelists.sol';

contract TestHasWhitelists is HasWhitelists {

  function testIsWhitelisted (bytes32 _whitelist, address _address) isWhitelisted(_whitelist, _address) returns (bool) {
    return true;
  }

}
