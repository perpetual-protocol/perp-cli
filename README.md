`perp-cli` is a CLI for showing information from Perpetual Protocol

# Installation

```bash
$ npm install @perp/cli -g
```
# Usage

## Basic

```shell
# List position history
$ perp position [--trader <trader_address>] [--pair <pair>] [--block-limit <block_limit>]

# show portfolio
$ perp portfolio <trader_address>

# show amm information
$ perp amm [<amm_address>] [--short] //--short option provides a brief summary

# decode and verify function data with certain contract address
$ perp verify 0x33FbaeFb2dCc3B7e0B80afbB4377C2EB64AF0a3A \
    0x0dd68c7000000000000000000000000000000000000000000000000ad78ebc5ac6200000000000000000000000000000000000000000000000034f086f3b33b684000000
```

## Advanced (Not available yet)

Use `export PERP_MNEMONIC=<mnemonic>` to set a private key. Then you can use `perp exec` to execute transactions with an execution file.

```shell
$ perp exec <filename>
```

For example, if you want to open a long position for BTC, the execution file will be as follows:

```
- action: openPosition
  args:
    amm: <amm_address>
    side: 0|1 // Indicates a long position
    quoteAssetAmount: 1000
    leverage: 2
    baseAssetAmountLimit: 100 // Set min. position size here to control slippage
```

# Development

For testing, you can use `ts-node` to execute and test commands, e.g.:

```shell
# Mainnet
$ perp position

# Testnet
$ npx ts-node src/index.ts position
```
