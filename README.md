# starkex-eth
library for interacting and parsing logs for the starkware smart contracts

## Goal

Create a single js file to be loadable and runnable from native code in iOS and Android, to derive public key from private key

## Browsify
Ended up not using webpack. Keep the instruction here if we need to expand the usage. Use Browsify instead
browserify ./build/src/lib/BytesHelper.js --standalone StarkHelper > ./build/starkex-eth.js