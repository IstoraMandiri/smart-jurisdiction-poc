pragma solidity ^0.4.16;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Whitelist.sol';


/// @title Whitelist Interface
/// @notice Helper methods for calling external whitelist contract
/// @author Chris Hitchcott

contract HasWhitelists is Ownable {

  mapping (bytes32 => address) public whitelists;

  modifier isWhitelisted(bytes32 _whitelist, address _address) {
    require(getWhitelisted(_whitelist, _address));
    _;
  }

  /// @notice Returns whether an address is whitelisted or not
  /// @dev Returns true or false if whitelist exists, throws if whitelist is not registered
  /// @param _whitelist The name of the whitelist
  /// @param _address The address to query
  /// @return _value Whether the user is whitelisted
  function getWhitelisted(bytes32 _whitelist, address _address) public returns (bool _value) {
    require(whitelists[_whitelist] > 0x0);
    Whitelist whitelist = Whitelist(whitelists[_whitelist]);
    return whitelist.whitelist(_address);
  }

  /// @notice Register (or unregister) a new whitelist
  /// @dev Can only be called by admin
  /// @param _whitelist The name of the whitelist
  /// @param _address The contract address of the whitelist
  /// @return _success Transaction was successful
  function registerWhitelist(bytes32 _whitelist, address _address) public onlyOwner returns (bool _success) {
    whitelists[_whitelist] = _address;
    return true;
  }
}
