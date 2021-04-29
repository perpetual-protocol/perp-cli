import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import InsuranceFundArtifact from "@perp/contract/build/contracts/src/InsuranceFund.sol/InsuranceFund.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import chalk from "chalk"
import { utils } from "ethers"
import { CommandModule } from "yargs"
import { formatProperty } from "../format"
import { fetchMetadata } from "../metadata"
import { getProvider } from "../provider"
import { getStageName } from "../stage"
import { InsuranceFund, Amm, ClearingHouse } from "../type"
import { instance } from "./utils/tx"

function isAddress(str: string): boolean {
    if (!str) return false
    if (str.startsWith("0x") && str.length == 42) {
        return true
    } else if (str.length == 40) {
        return true
    }
    return false
}

const ammCommand: CommandModule = {
    command: "amm [<amm>]",
    describe: "show amms' status",
    builder: yargs =>
        yargs.boolean("short").alias("short", ["s"]).describe("short", "only list pair/address").positional("amm", {
            describe: "amm's address or amm pair, eg. UNI",
            type: "string",
        }),

    handler: async argv => {
        const stageName = getStageName()
        const provider = getProvider()
        const metadata = await fetchMetadata(stageName)
        const layer2Contracts = metadata.layers.layer2.contracts
        const flagShortList = argv.short as boolean
        const ammArg = argv.amm as string
        const ammPair = isAddress(ammArg) ? "" : ammArg

        const insuranceFund = instance(
            layer2Contracts.InsuranceFund.address,
            InsuranceFundArtifact.abi,
            provider,
        ) as InsuranceFund

        const clearingHouse = instance(
            layer2Contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            provider,
        ) as ClearingHouse

        let ammAddressList
        if (ammArg && !ammPair) {
            ammAddressList = [ammArg]
        } else {
            ammAddressList = await insuranceFund.getAllAmms()
        }

        for (const it of ammAddressList) {
            const amm = instance(it, AmmArtifact.abi, provider) as Amm
            const priceFeedKey = utils.parseBytes32String(await amm.priceFeedKey())
            if (ammPair && ammPair != priceFeedKey) {
                continue
            }

            const openInterestNotionalCap = await amm.getOpenInterestNotionalCap()
            const openInterestNotional = await clearingHouse.openInterestNotionalMap(it)
            const maxHoldingBaseAsset = await amm.getMaxHoldingBaseAsset()
            const reserve = await amm.getReserve()
            const quoteAssetReserve = reserve[0]
            const baseAssetReserve = reserve[1]
            const priceFeed = await amm.priceFeed()
            let priceFeedName = ""

            if (priceFeed === layer2Contracts.L2PriceFeed.address) {
                priceFeedName = "L2PriceFeed"
            } else if (priceFeed === layer2Contracts.ChainlinkPriceFeed.address) {
                priceFeedName = "ChainlinkPriceFeed"
            } else {
                throw new Error(
                    "PriceFeed is not L2PriceFeed or ChainlinkPriceFeed, check it immediately!! address: " + priceFeed,
                )
            }

            if (flagShortList) {
                console.log(formatProperty(`${priceFeedKey}/USDC`, it))
            } else {
                console.log(chalk.green(`${priceFeedKey}/USDC`))

                console.log(formatProperty("Proxy Address", it))
                console.log(
                    formatProperty("OpenInterestNotionalCap", utils.formatEther(openInterestNotionalCap.toString())) +
                        " USDC",
                )
                console.log(
                    formatProperty("OpenInterestNotional", utils.formatEther(openInterestNotional.toString())) +
                        " USDC",
                )
                console.log(
                    formatProperty("MaxHoldingBaseAsset", utils.formatEther(maxHoldingBaseAsset.toString())) +
                        ` ${priceFeedKey}`,
                )
                console.log(
                    formatProperty("QuoteAssetReserve", utils.formatEther(quoteAssetReserve.toString())) + " USDC",
                )
                console.log(
                    formatProperty("BaseAssetReserve", utils.formatEther(baseAssetReserve.toString())) +
                        ` ${priceFeedKey}USDC`,
                )
                console.log(formatProperty("PriceFeed", priceFeedName))
                console.log("")
            }
            if (ammPair && ammPair == priceFeedKey) {
                break
            }
        }
    },
}

export default ammCommand
