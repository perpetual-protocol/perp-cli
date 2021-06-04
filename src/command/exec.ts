import { BigNumber, Overrides, Wallet } from "ethers"
import { CommandModule } from "yargs"
import { formatError, formatInfo, formatProperty, formatTitle } from "../util/format"
import { fetchConfiguration, fetchMetadata, Contracts } from "../util/metadata"

import { getProvider, Layer } from "../util/provider"
import { getStageName } from "../util/stage"

import { Action, layerOfFunction, actionOfFunction, actionMaps, Options } from "../util/functionsMap"
import { PERP_MNEMONIC } from "../util/constant"
import yaml from "js-yaml"
import fs from "fs"
import path from "path"
import { throwError } from "../util/utils"

// default gas price of layer 2: 1g wei
const DEFAULT_LAYER2_GAS_PRICE = 1_000_000_000
// default gas price of layer 1: 20g wei
const DEFAULT_LAYER1_GAS_PRICE = 20_000_000_000

function getGasPrice(gasPrice: number): number {
    if (gasPrice != undefined) {
        if (gasPrice > 10000) {
            throwError(`incorrect gas price, input should be ${gasPrice / 1e9} instead of ${gasPrice}`)
        }
        gasPrice *= 1e9
    }
    return gasPrice
}

const execCommand: CommandModule = {
    command: "exec <filename>",
    describe: "interact with contracts",
    builder: yargs =>
        yargs
            .positional("filename", {
                describe: "a yml format file",
                type: "string",
            })
            .option("gasPrice", {
                alias: "g",
                type: "number",
                describe: "gas price in gwei, eg. 1.5 means 1.5 gwei",
            })
            .option("nonce", {
                alias: "n",
                type: "number",
                describe: "user's nonce",
            }),

    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const metadata = await fetchMetadata(stageName)
        const config = await fetchConfiguration(stageName)
        const file = argv.filename as string
        let gasPrice = getGasPrice(argv["gasPrice"] as number)
        let nonce = argv["nonce"] as number
        console.log(formatInfo(`** send the following txs on ${stageName} **\n`))

        const fullExecFilePath = path.resolve(file)
        const actions = yaml.load(fs.readFileSync(fullExecFilePath, "utf-8")) as Action[]
        const wallet = Wallet.fromMnemonic(PERP_MNEMONIC)

        for (const action of actions) {
            const functionName = action.action as keyof actionOfFunction
            const layer = layerOfFunction(functionName)
            if (gasPrice === undefined) {
                if (layer == Layer.Layer1) gasPrice = DEFAULT_LAYER1_GAS_PRICE
                else gasPrice = DEFAULT_LAYER2_GAS_PRICE
            }

            // gasPrice: if gasPrice is set in yml, overwrite the gasPrice from the inputs
            // nonce: if nonce is not set, keep it undefined
            const options: Options = {
                gasPrice: action.options?.gasPrice || BigNumber.from(gasPrice),
                gasLimit: action.options?.gasLimit,
                nonce: nonce ? BigNumber.from(nonce) : undefined,
            }
            const gasPriceForConsole = BigNumber.from(options.gasPrice).toNumber() / 1e9
            const signer = wallet.connect(getProvider(layer, config))
            const nextNonce = nonce ? BigNumber.from(nonce++) : await signer.getTransactionCount()
            console.log(formatTitle(action.action))
            console.log(
                formatProperty(
                    "property",
                    `gas price ${gasPriceForConsole}g wei, nonce ${nextNonce} and gas limit ${options.gasLimit}`,
                ),
            )
            console.log(action.args)

            const receipt = await actionMaps[functionName](metadata, signer, action.args, options)
            console.log(formatProperty("tx hash", receipt.transactionHash))
            console.log(formatProperty("gas used", Intl.NumberFormat("en-US").format(receipt.gasUsed.toNumber())))
            console.log()
        }
        return
    },
}

export default execCommand
