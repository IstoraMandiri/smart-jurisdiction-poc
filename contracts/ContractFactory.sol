pragma solidity ^0.4.16;

import './TokenTemplate.sol';

/// @title Example Contract Factory
/// @notice Allows managers to deploy and configure a specific contract with constraints defined by admin
/// @author Chris Hitchcott

contract ContractFactory is Ownable, HasWhitelists {

  event Deploy(address indexed _contract, address indexed _manager);

  uint256 public maxInitialBalance = 0;
  address public traderWhitelist;
  mapping (address => address) public deployments;

  /// @notice Sets the maximum initial balance for new deployments
  /// @dev Can only be called by admin
  /// @param _maxInitialBalance New maximum possible balance
  /// @return _success Transaction was successful
  function configureMaxInitialBalance (uint256 _maxInitialBalance) public onlyOwner returns (bool _success) {
    maxInitialBalance = _maxInitialBalance;
    return true;
  }

  /// @notice Sets the address for the whitelist of new deployments
  /// @dev Can only be called by admin
  /// @param _traderWhitelist Address of whitelist contract
  /// @return _success Transaction was successful
  function configureTraderWhitelist (address _traderWhitelist) public onlyOwner returns (bool _success) {
    traderWhitelist = _traderWhitelist;
    return true;
  }

  /// @notice Deploys a new ERC20 Contract
  /// @dev Can only be called by managers
  /// @param _initialBalance Initial token balance of sender
  /// @return _contract Address of deployed contract
  function deploy (uint256 _initialBalance) public isWhitelisted("manager", msg.sender) returns (address _contract) {
    // validate configuration
    require(_initialBalance <= maxInitialBalance);
    // deploy the new token, pass the owner (admin) address
    address tokenAddress = new TokenTemplate();
    TokenTemplate token = TokenTemplate(tokenAddress);
    // configure the new token
    token.registerWhitelist("trader", traderWhitelist);
    token.mint(msg.sender, _initialBalance);
    token.finishMinting();
    // transfer ownership to the admin
    token.transferOwnership(owner);
    // register the deployment
    deployments[tokenAddress] = msg.sender;
    // emit event
    Deploy(tokenAddress, msg.sender);
    return tokenAddress;
  }

}
