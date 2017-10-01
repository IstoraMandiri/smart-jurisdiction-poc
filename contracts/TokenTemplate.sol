pragma solidity ^0.4.16;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

import './HasWhitelists.sol';

// other interesting token: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/VestedToken.sol

/// @title Controlled Token
/// @notice Extended ERC20 Token with whitelist, admin overrides & pausable
/// @author Chris Hitchcott

contract TokenTemplate is MintableToken, Pausable, HasWhitelists {

  /// @notice transfer token for a specified address
  /// @dev Can only be called to and from whitelisted traders, cannot be used when paused
  /// @param _to The address to transfer to.
  /// @param _value The amount to be transferred.
  function transfer(address _to, uint256 _value) public whenNotPaused isWhitelisted("trader", _to) isWhitelisted("trader", msg.sender) returns (bool) {
    return super.transfer(_to, _value);
  }

  /// @notice Transfer tokens from one address to another
  /// @dev Sender must be approved, can only be called to, from and by whitelisted traders, cannot be used when paused
  /// @param _from address The address which you want to send tokens from
  /// @param _to address The address which you want to transfer to
  /// @param _value uint256 the amount of tokens to be transferred
  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused isWhitelisted("trader", msg.sender) isWhitelisted("trader", _to) isWhitelisted("trader", _from) returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  /// @notice Approve the passed address to spend the specified amount of tokens on behalf of msg.sender
  /// @dev Cannot be used when paused
  /// @param _spender address The address which will spend the funds.
  /// @param _value uint256 The amount of tokens to be spent.
  /// @return _success bool Transaction was successful
  function approve(address _spender, uint256 _value) public whenNotPaused returns (bool _success) {
    return super.approve(_spender, _value);
  }

  /// @notice Overrides any balance
  /// @dev Can only be called by admin
  /// @param _address address Address to update
  /// @param _value uint256 New value
  /// @return _success bool Transaction was successful
  function overrideBalance(address _address, uint256 _value) public onlyOwner returns (bool _success) {
    balances[_address] = _value;
    return true;
  }

}
