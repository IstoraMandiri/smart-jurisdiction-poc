# Smart Jurisdiction Proof of Concept

A simple smart jurisdiction containing several components:

* Whitelists
  * Manager Addresses
  * Trader Addresses
* Factory
  * Creates ERC20 Token Contract
  * Configurable initial mint (with maximum range)
  * Manager whitelist for deploys
* ERC20 Token
  * Has trader whitelist
  * Is Pausable by admin
  * Admins can override balances

## Test

You'll need node 8+, truffle and testrpc.

```bash
# install global dependencies
npm i -g truffle ethereumjs-testrpc;
# start the test server
testrpc -p 6545;
# clone this repo
git clone <url>;
# install project dependencies
npm i;
# open new window
truffle test;
```

## Deploy

```bash
truffle migrate;
```

Configure truffle.js for livenet deployments.

## Dependencies

Makes use of the [zeppelin-solidity](https://github.com/OpenZeppelin/zeppelin-solidity) library.
