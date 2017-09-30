pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Whitelist.sol';

contract HasWhitelists is Ownable {

  mapping (bytes32 => address) whitelists;

  modifier isWhitelisted(bytes32 _whitelist, address _address) {
    Whitelist whitelist = Whitelist(whitelists[_whitelist]);
    require(whitelist.get(_address));
    _;
  }

  function registerWhitelist(bytes32 _whitelist, address _address) public onlyOwner returns (bool) {
    whitelists[_whitelist] = _address;
    return true;
  }
}
