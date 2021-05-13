`perp-cli` is a CLI for showing information from Perpetual Protocol

# Installation

```bash
$ npm install @perp/cli -g
```
# Usage

## Basic

### List position history

```shell
$ perp position [-t --trader <trader_address>] [-p --pair <pair>] [-b --block-limit <number_of_blocks>]
```
Pass `--block-limit` to increase the number of blocks included in the query. E.g. `--block-limit 100`.

**Example**

Executing `perp position` without argument will print events from the latest blocks:
```shell
$ perp position

# output
PositionChanged event #1
- trader: 0x1A48776f436bcDAA16845A378666cf4BA131eb0F
- asset: SUSHI
- side: Sell
- price: 13.236997627686497
- size: -115.30952971718546
- tx: 0x3cbdf712ba932c166b4a133222bd7e99db1ab0b87309f5d38f762c7c4e2fd61b

PositionChanged event #2
- trader: 0x1A48776f436bcDAA16845A378666cf4BA131eb0F
- asset: ETH
- side: Buy
- price: 3283.4358765361426
- size: 2.0827363515715733
- tx: 0x52f31396911712a83b8441bea113165972134b5202c6b05303ec5b01b72d6d37
...
```

Use `--pair` to filter by pair name:

```shell
$ perp position --pair SUSHI

# output
PositionChanged event #1
- trader: 0x1A48776f436bcDAA16845A378666cf4BA131eb0F
- asset: SUSHI
- side: Sell
- price: 13.22600697160442
- size: -116.05734562353427
- tx: 0x008a50e79f6e1ecec50f3c1bc766a9b2cd155abb452992ede1ec5690cb9c8d9e
```
### Show portfolio
```
$ perp portfolio <trader_address>
```

**Example**

```shell
$ perp portfolio 0x3F84E391EA8dc12946e17d1d85cdf0B35D4fE650

# output
Balances
- layer1: 10.0 USDC
- layer2: 116.859403 USDC

REN/USDC
- position size: 2.878166768945520764
- margin (with funding payment): 2.886617127644597577
- margin ratio: 95.7809012212265534 %
- leverage: 1.044049478810274839
- pnl: -0.312628163013417874
- liq. price: 0.042020407273170428
- open notional: 3.0
- last open at block: 15054547

PERP/USDC
- position size: 0.597478364874149768
- margin (with funding payment): 4.780747258528859304
- margin ratio: 95.7024239352036863 %
- leverage: 1.044985755615511108
- pnl: 0.093078655279783096
- liq. price: 0.391427760609808801
- open notional: 5.0
- last open at block: 15310098
...
```
### Show AMM information

```
$ perp amm [<amm_address> | <amm_pair>] [--short] # --short option prints AMM addresses only
```

**Example**
```shell
$ perp amm # print all AMMs

# output
ETH/USDC
- Proxy Address: 0x8d22F1a9dCe724D8c1B4c688D75f17A2fE2D32df
- Index Price: 3286.42891337 USDC
- Market Price: 3273.948842246225192819 USDC
- OpenInterestNotionalCap: 22500000.0 USDC
- OpenInterestNotional: 16108206.924430313991067613 USDC
- MaxHoldingBaseAsset: 600.0 ETH
- QuoteAssetReserve: 27672432.824130644164885504 USDC
- BaseAssetReserve: 8452.31069803303674636 ETHUSDC
- PriceFeed: ChainlinkPriceFeed

BTC/USDC
- Proxy Address: 0x0f346e19F01471C02485DF1758cfd3d624E399B4
- Index Price: 54862.54242867 USDC
- Market Price: 54485.779655798418790014 USDC
- OpenInterestNotionalCap: 12000000.0 USDC
- OpenInterestNotional: 6779239.202039263998851256 USDC
- MaxHoldingBaseAsset: 10.0 BTC
- QuoteAssetReserve: 16110169.546358917053350114 USDC
- BaseAssetReserve: 295.676590261372177256 BTCUSDC
- PriceFeed: ChainlinkPriceFeed
...
```

```shell
$ perp amm --short

# output
- ETH/USDC: 0x8d22F1a9dCe724D8c1B4c688D75f17A2fE2D32df
- BTC/USDC: 0x0f346e19F01471C02485DF1758cfd3d624E399B4
- YFI/USDC: 0xd41025350582674144102B74B8248550580bb869
- DOT/USDC: 0x6de775aaBEEedE8EFdB1a257198d56A3aC18C2FD
- SNX/USDC: 0xb397389B61cbF3920d297b4ea1847996eb2ac8E8
- LINK/USDC: 0x80DaF8ABD5a6Ba182033B6464e3E39A0155DCC10
- AAVE/USDC: 0x16A7ECF2c27Cb367Df36d39e389e66B42000E0dF
...
```

```shell
$ perp amm UNI # filter by pair name

# output
UNI/USDC
- Proxy Address: 0xeaC6CEE594EdD353351BaBc145C624849Bb70b11
- Index Price: 43.04925808 USDC
- Market Price: 42.857791240741121583 USDC
- OpenInterestNotionalCap: 4000000.0 USDC
- OpenInterestNotional: 1796837.823164769060256498 USDC
- MaxHoldingBaseAsset: 3500.0 UNI
- QuoteAssetReserve: 10196674.418431856730146294 USDC
- BaseAssetReserve: 237918.80363491009364506 UNIUSDC
- PriceFeed: ChainlinkPriceFeed

```

### Verify function data

```shell
$ perp verify <contract_address> <byte_code>
```

**Example**
```shell
$ perp verify 0x33FbaeFb2dCc3B7e0B80afbB4377C2EB64AF0a3A 0x0dd68c7000000000000000000000000000000000000000000000000ad78ebc5ac6200000000000000000000000000000000000000000000000034f086f3b33b684000000

output:
  Contract COMPUSDC (Amm)
  - function name: setCap
  - args:
  [
    [
      "200000000000000000000 (200.0)"
    ],
    [
      "4000000000000000000000000 (4000000.0)"
    ]
  ]
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
