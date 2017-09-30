pragma solidity ^0.4.16;

import './TokenTemplate.sol';

contract ContractFactory is Ownable, HasWhitelists {

  uint256 maxInitialBalance = 0;
  address traderWhitelist;
  mapping (address => address) deployments;

  function configureMaxInitialBalance (uint256 _maxInitialBalance) public onlyOwner returns (bool) {
    maxInitialBalance = _maxInitialBalance;
    return true;
  }

  function conigureTraderWhitelist (address _traderWhitelist) public onlyOwner returns (bool) {
    traderWhitelist = _traderWhitelist;
    return true;
  }

  function deploy (uint256 _initialBalance) public isWhitelisted("manager", msg.sender) returns (address _contract) {
    // validate configuration
    require(_initialBalance <= maxInitialBalance);
    // deploy the new token, pass the owner (admin) address
    address tokenAddress = new TokenTemplate(owner);
    TokenTemplate token = TokenTemplate(tokenAddress);
    // configure the new token
    token.registerWhitelist("trader", traderWhitelist);
    token.mint(msg.sender, _initialBalance);
    token.finishMinting();
    // register the deployment
    deployments[tokenAddress] = msg.sender;
    // TODO events
    return tokenAddress;
  }

}
