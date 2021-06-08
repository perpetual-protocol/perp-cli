import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import chalk from "chalk"
import { Contract, utils } from "ethers"
import { CommandModule } from "yargs"
import { toNumber } from "../util/casting"
import { formatProperty } from "../util/format"
import { fetchConfiguration, fetchMetadata } from "../util/metadata"
import { getProvider, Layer, NetworkName } from "../util/provider"
import { getStageName } from "../util/stage"
import { Amm, ClearingHouse } from "../type"
import { getContract } from "../util/contract"
import { getEstimatedBlockTimestamp, timestamp2DateStr } from "../util/time"
import { BaseLogger } from "../cli/middeware"

const DEFAULT_BLOCK_LIMIT = 10
const DEFAULT_FILTER_VALUE = 10

const positionCommand: CommandModule = {
    command: "position",
    describe: "show position history",
    builder: yargs =>
        yargs
            .option("trader", {
                alias: "t",
                type: "string",
                describe: "filter for trader address",
            })
            .option("block-limit", {
                alias: "b",
                type: "number",
                describe: "block limit for querying",
                default: DEFAULT_BLOCK_LIMIT,
            })
            // FIXME: not implemented yet
            .option("pair", {
                alias: "p",
                type: "string",
                describe: "filter for pair such as BTC",
            })
            .option("liquidated", {
                alias: "l",
                type: "boolean",
                describe: "filter for liquidated positions",
            })
            .option("greater-than", {
                alias: "gt",
                type: "number",
                describe: " only show value great than certain USD value",
                default: DEFAULT_FILTER_VALUE,
            }),
    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const metadata = await fetchMetadata(stageName)
        const config = await fetchConfiguration(stageName)
        const provider = getProvider(Layer.Layer2, config)
        const clearingHouse = new Contract(
            metadata.layers.layer2.contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            provider,
        ) as ClearingHouse
        const blockNumber = await provider.getBlockNumber()
        const trader = (argv["trader"] as string) || null
        const blockLimit = (argv["blockLimit"] as number) || DEFAULT_BLOCK_LIMIT
        const ammPairMap = new Map<string, string>()
        const filter = clearingHouse.filters.PositionChanged(
            trader,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        )
        const events = await clearingHouse.queryFilter(filter, blockNumber - blockLimit, blockNumber)
        const logger = argv.logger as BaseLogger
        const { formatTitle, formatProperty, log } = logger

        let i = 0
        for (const event of events) {
            const side = event.args.exchangedPositionSize.gt(0) ? "Buy" : "Sell"
            const positionNotional = toNumber(event.args.positionNotional)
            const exchangedPositionSize = toNumber(event.args.exchangedPositionSize)
            const price = Math.abs(positionNotional / exchangedPositionSize)
            const value = Math.abs(price * exchangedPositionSize)
            const timestamp = getEstimatedBlockTimestamp(
                metadata.layers.layer2.network as NetworkName,
                blockNumber,
                Date.now() / 1000,
                event.blockNumber!,
            )

            let pairName = ""

            if (ammPairMap.has(event.args.amm)) {
                pairName = ammPairMap.get(event.args.amm) || ""
            } else {
                const amm = getContract<Amm>(event.args.amm, AmmArtifact.abi, provider)
                pairName = utils.parseBytes32String(await amm.priceFeedKey())
                ammPairMap.set(event.args.amm, pairName)
            }

            if (argv["pair"] && argv["pair"] !== pairName) {
                continue
            }

            if (argv["liquidated"] && event.args.liquidationPenalty.eq(0)) {
                continue
            }

            if (argv["gt"] && value < (argv["gt"] as number)) {
                continue
            }

            log(formatTitle(`PositionChanged event #${i + 1}`))
            log(formatProperty("estimated time", timestamp2DateStr(timestamp)))
            log(formatProperty("trader", event.args.trader))
            log(formatProperty("asset", pairName))
            log(formatProperty("side", side))
            log(formatProperty("price", price))
            log(formatProperty("size", exchangedPositionSize))
            log(formatProperty("tx", event.transactionHash))
            log("")
            i++
        }
    },
}

export default positionCommand
