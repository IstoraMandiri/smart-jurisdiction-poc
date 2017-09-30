pragma solidity ^0.4.16;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/// @title Whitelist
/// @dev A simple ownable registry mapping addressess to a bool

contract Whitelist is Ownable {

  // TODO events
  mapping(address => bool) whitelist;

  /// @dev Updates the registry
  /// @param _address Address to update
  /// @param _value New value
  function set(address _address, bool _value) onlyOwner public returns (bool _success) {
    whitelist[_address] = _value;
    return true;
  }

  /// @dev Updates the registry
  /// @param _address Address being queried
  /// @return _value The value of the entry
  function get(address _address) public constant returns (bool _value) {
    return whitelist[_address];
  }

  // TODO enable the following for conveneince
  /*
  function setMany(address[] _addresses, bool[] _values) onlyOwner public returns (bool _success) {
    for (uint8 i = 0; i < _addresses.length; i++) {
      set(_address[i], _values[i]);
    }
    return true;
  }

  function getMany(address[] _addresses) public constant returns (bool[] _values) {
    bool[] memory result = new bool[](_addresses.length);
    for (uint8 i = 0; i < _addresses.length; i++) {
      result[i] = whitelist[i];
    }
    return result;
  }
  */

}
