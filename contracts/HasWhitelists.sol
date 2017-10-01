pragma solidity ^0.4.16;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Whitelist.sol';


/// @title Whitelist Interface
/// @dev Helper methods for calling external whitelist contract
/// @author Chris Hitchcott

contract HasWhitelists is Ownable {

  mapping (bytes32 => address) public whitelists;

  modifier isWhitelisted(bytes32 _whitelist, address _address) {
    require(getWhitelisted(_whitelist, _address));
    _;
  }

  /// @dev Returns whether an address is whitelisted or not
  /// @notice Returns true or false if whitelist exists, throws if whitelist is not registered
  /// @param _whitelist bytes32 The name of the whitelist
  /// @param _address address The address to query
  /// @return _value bool Whether the user is whitelisted
  function getWhitelisted(bytes32 _whitelist, address _address) public returns (bool _value) {
    require(whitelists[_whitelist] > 0x0);
    Whitelist whitelist = Whitelist(whitelists[_whitelist]);
    return whitelist.whitelist(_address);
  }

  /// @dev Register (or unregister) a new whitelist
  /// @param _whitelist bytes32 The name of the whitelist
  /// @param _address address The contract address of the whitelist
  /// @return _success bool Transaction was successful
  function registerWhitelist(bytes32 _whitelist, address _address) public onlyOwner returns (bool _success) {
    whitelists[_whitelist] = _address;
    return true;
  }
}
