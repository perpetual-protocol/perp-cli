import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import chalk from "chalk"
import { Contract, utils } from "ethers"
import { CommandModule } from "yargs"
import { toNumber } from "../util/casting"
import { formatProperty } from "../util/format"
import { fetchMetadata } from "../util/metadata"
import { getProvider } from "../util/provider"
import { getStageName } from "../util/stage"
import { Amm, ClearingHouse } from "../type"
import { getContract } from "../util/contract"

const DEFAULT_BLOCK_LIMIT = 10

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
            }),
    handler: async argv => {
        const stageName = getStageName()
        const provider = getProvider()
        const metadata = await fetchMetadata(stageName)
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
        let i = 0
        for (const event of events) {
            const side = event.args.exchangedPositionSize.gt(0) ? "Buy" : "Sell"
            const positionNotional = toNumber(event.args.positionNotional)
            const exchangedPositionSize = toNumber(event.args.exchangedPositionSize)
            const price = Math.abs(positionNotional / exchangedPositionSize)
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

            console.log(chalk.green(`PositionChanged event #${i + 1}`))
            console.log(formatProperty("trader", event.args.trader))
            console.log(formatProperty("asset", pairName))
            console.log(formatProperty("side", side))
            console.log(formatProperty("price", price))
            console.log(formatProperty("size", exchangedPositionSize))
            console.log(formatProperty("tx", event.transactionHash))
            console.log("")
            i++
        }
    },
}

export default positionCommand
