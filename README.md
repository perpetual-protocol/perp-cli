perp-cli is a CLI for showing information

# Usage

## Basic
```shell
# List position
$ perp position [--trader=<trader_address>] [--amm=<amm_address>] [--limit=<limit>]

# show portfolio
$ perp portfolio <trader_address>

# show amm information
$ perp amm [<amm_address>] [--short]
 
# switch to staging environment
$ perp amm [--stage production|staging]
```

## Advanced
use `PERP_MNEMONIC=<mnemonic>` to set a private key for manipulation, then you can use `perp exec` to execute transactions with an execution file.

```shell
$ perp exec <filename>
```

for example, you want to open a long position for BTC, the execution file will be like this:

```
- action: openPosition
  args:
    amm: <amm_address>
    side: 0|1
    quoteAssetAmount: 1000
    leverage: 2
    baseAssetAmountLimit: 100
```
