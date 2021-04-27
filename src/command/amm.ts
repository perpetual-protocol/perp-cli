import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import InsuranceFundArtifact from "@perp/contract/build/contracts/src/InsuranceFund.sol/InsuranceFund.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import chalk from "chalk"
import { Fragment, JsonFragment } from "@ethersproject/abi"
import { Contract, providers, utils } from "ethers"
import { CommandModule } from "yargs"
import { formatProperty } from "../format"
import { fetchMetadata } from "../metadata"
import { getProvider } from "../provider"
import { getStageName } from "../stage"
import { InsuranceFund, Amm, ClearingHouse } from "../type"

function instance(
    address: string,
    abi: Array<string | Fragment | JsonFragment>,
    provider: providers.Provider,
): Contract {
    return new Contract(address, abi, provider) as Contract
}

const ammCommand: CommandModule = {
    command: "amm",
    describe: "show amm status",
    builder: yargs =>
        yargs.option("short", {
            alias: "s",
            type: "string",
            describe: "list amm pairs",
        }),
    handler: async argv => {
        const stageName = getStageName()
        const provider = getProvider()
        const metadata = await fetchMetadata(stageName)
        const layer2Contracts = metadata.layers.layer2.contracts

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

        const ammAddressList = await insuranceFund.getAllAmms()
        for (const it of ammAddressList) {
            const amm = instance(it, AmmArtifact.abi, provider) as Amm
            const priceFeedKey = utils.parseBytes32String(await amm.priceFeedKey())
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

            console.log(chalk.green(`${priceFeedKey}/USDC`))

            console.log(formatProperty("Proxy Address", it))
            console.log(
                formatProperty("OpenInterestNotionalCap", utils.formatEther(openInterestNotionalCap.toString())) +
                    " USDC",
            )
            console.log(
                formatProperty("OpenInterestNotional", utils.formatEther(openInterestNotional.toString())) + " USDC",
            )
            console.log(
                formatProperty("MaxHoldingBaseAsset", utils.formatEther(maxHoldingBaseAsset.toString())) +
                    ` ${priceFeedKey}`,
            )
            console.log(formatProperty("QuoteAssetReserve", utils.formatEther(quoteAssetReserve.toString())) + " USDC")
            console.log(
                formatProperty("BaseAssetReserve", utils.formatEther(baseAssetReserve.toString())) +
                    ` ${priceFeedKey}USDC`,
            )
            console.log(formatProperty("PriceFeed", priceFeedName))
            console.log("")
        }
    },
}

export default ammCommand
