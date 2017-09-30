pragma solidity ^0.4.16;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

import './HasWhitelists.sol';

// other interesting things: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/VestedToken.sol

// normal erc20 extended with:
// x whitelists for transfers
// x balances can be overwridden by admin
// x is pausable by admin

contract TokenTemplate is MintableToken, Pausable, HasWhitelists {

  // make sure the owner is the admin
  function TokenTemplate (address _owner) {
    owner = _owner;
  }

  function transfer(address _to, uint256 _value) public whenNotPaused isWhitelisted("trader", _to) isWhitelisted("trader", msg.sender) returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused isWhitelisted("trader", _to) isWhitelisted("trader", _from) returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
    return super.approve(_spender, _value);
  }

  function overrideBalance(address _address, uint256 _value) public onlyOwner returns (bool) {
    balances[_address] = _value;
    return true;
  }

}
