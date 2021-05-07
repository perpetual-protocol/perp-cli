import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import TetherTokenArtifact from "@perp/contract/build/contracts/src/mock/TetherToken.sol/TetherToken.json"
import InsuranceFundArtifact from "@perp/contract/build/contracts/src/InsuranceFund.sol/InsuranceFund.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import chalk from "chalk"
import { utils } from "ethers"
import { CommandModule } from "yargs"
import { formatDecimal, formatProperty, formatTitle } from "../util/format"
import { fetchConfiguration, fetchMetadata } from "../util/metadata"
import { getProvider, Layer } from "../util/provider"
import { getStageName } from "../util/stage"
import { InsuranceFund, Amm, ClearingHouse, TetherToken } from "../type"
import { getContract } from "../util/contract"

const ammCommand: CommandModule = {
    command: "amm [<amm>]",
    describe: "show amms' status",
    builder: yargs =>
        yargs.boolean("short").alias("short", ["s"]).describe("short", "only list pair/address").positional("amm", {
            describe: "amm's address or amm pair, eg. UNI",
            type: "string",
        }),

    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const config = await fetchConfiguration(stageName)
        const metadata = await fetchMetadata(stageName)
        const provider = getProvider(Layer.Layer2, config)
        const layer2Contracts = metadata.layers.layer2.contracts
        const flagShortList = argv.short as boolean
        const ammArg = argv.amm as string
        const ammPair = utils.isAddress(ammArg) ? "" : ammArg
        const tokenSymbolMap = new Map<string, string>()

        const insuranceFund = getContract<InsuranceFund>(
            layer2Contracts.InsuranceFund.address,
            InsuranceFundArtifact.abi,
            provider,
        )

        const clearingHouse = getContract<ClearingHouse>(
            layer2Contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            provider,
        )

        let ammAddressList
        if (ammArg && !ammPair) {
            ammAddressList = [ammArg]
        } else {
            ammAddressList = await insuranceFund.getAllAmms()
        }

        for (const addr of ammAddressList) {
            const amm = getContract<Amm>(addr, AmmArtifact.abi, provider)
            const priceFeedKey = utils.parseBytes32String(await amm.priceFeedKey())
            if (ammPair && ammPair != priceFeedKey) {
                continue
            }

            const openInterestNotionalCap = await amm.getOpenInterestNotionalCap()
            const openInterestNotional = await clearingHouse.openInterestNotionalMap(addr)
            const maxHoldingBaseAsset = await amm.getMaxHoldingBaseAsset()
            const indexPrice = await amm.getUnderlyingPrice()
            const marketPrice = await amm.getSpotPrice()
            const reserve = await amm.getReserve()
            const quoteAssetAddress = await amm.quoteAsset()
            const quoteAssetReserve = reserve[0]
            const baseAssetReserve = reserve[1]
            const priceFeed = await amm.priceFeed()
            let symbol = ""

            if (!tokenSymbolMap.has(quoteAssetAddress)) {
                const token = getContract<TetherToken>(quoteAssetAddress, TetherTokenArtifact.abi, provider)
                symbol = await token.symbol()
                tokenSymbolMap.set(quoteAssetAddress, symbol)
            } else {
                symbol = tokenSymbolMap.get(quoteAssetAddress) || ""
            }

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
                console.log(formatProperty(`${priceFeedKey}/${symbol}`, addr))
            } else {
                console.log(formatTitle(`${priceFeedKey}/${symbol}`))
                console.log(formatProperty("Proxy Address", addr))
                console.log(formatProperty("Index Price", `${formatDecimal(indexPrice)} ${symbol}`))
                console.log(formatProperty("Market Price", `${formatDecimal(marketPrice)} ${symbol}`))
                console.log(
                    formatProperty("OpenInterestNotionalCap", `${formatDecimal(openInterestNotionalCap)} ${symbol}`),
                )
                console.log(formatProperty("OpenInterestNotional", `${formatDecimal(openInterestNotional)} ${symbol}`))
                console.log(
                    formatProperty("MaxHoldingBaseAsset", `${formatDecimal(maxHoldingBaseAsset)} ${priceFeedKey}`),
                )
                console.log(formatProperty("QuoteAssetReserve", `${formatDecimal(quoteAssetReserve)} ${symbol}`))
                console.log(
                    formatProperty("BaseAssetReserve", formatDecimal(baseAssetReserve)) + ` ${priceFeedKey}${symbol}`,
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
