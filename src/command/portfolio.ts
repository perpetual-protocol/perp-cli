import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import InsuranceFundArtifact from "@perp/contract/build/contracts/src/InsuranceFund.sol/InsuranceFund.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import ClearingHouseViewerArtifact from "@perp/contract/build/contracts/src/ClearingHouseViewer.sol/ClearingHouseViewer.json"
import chalk from "chalk"
import { utils } from "ethers"
import { CommandModule } from "yargs"
import { formatProperty } from "../utils/format"
import { fetchMetadata } from "../utils/metadata"
import { getProvider } from "../utils/provider"
import { getStageName } from "../utils/stage"
import { InsuranceFund, Amm, ClearingHouse, ClearingHouseViewer } from "../type"
import { getLiquidationPrice } from "../utils/calculation"
import { ONE_ETH } from "../utils/dataTypes"
import { PnlCalcOption, MAINTENANCE_MARGIN_RATIO } from "../utils/constant"
import { getContract } from "../utils/contract"

const portfolioCommand: CommandModule = {
    command: "portfolio <trader_addr>",
    describe: "show trader's portfolio",
    builder: yargs =>
        yargs.positional("trader_addr", {
            describe: "trader's address",
            type: "string",
        }),

    handler: async argv => {
        const stageName = getStageName()
        const provider = getProvider()
        const metadata = await fetchMetadata(stageName)
        const layer2Contracts = metadata.layers.layer2.contracts
        const trader = argv.trader_addr as string

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

        const clearingHouseViewer = getContract<ClearingHouseViewer>(
            layer2Contracts.ClearingHouseViewer.address,
            ClearingHouseViewerArtifact.abi,
            provider,
        )

        const ammAddressList = await insuranceFund.getAllAmms()
        for (const addr of ammAddressList) {
            const pos = await clearingHouseViewer.getPersonalPositionWithFundingPayment(addr, trader)
            if (pos.size.d.isZero()) {
                continue
            }
            const amm = getContract<Amm>(addr, AmmArtifact.abi, provider)
            const priceFeedKey = utils.parseBytes32String(await amm.priceFeedKey())
            const marginRatio = await clearingHouseViewer.getMarginRatio(addr, trader)
            const quote = await amm.quoteAssetReserve()
            const base = await amm.baseAssetReserve()
            const k = quote.mul(base).div(ONE_ETH)
            const posNotionalNPnl = await clearingHouse.getPositionNotionalAndUnrealizedPnl(
                addr,
                trader,
                PnlCalcOption.SPOT_PRICE,
            )
            const leverage = posNotionalNPnl.positionNotional.d
                .mul(ONE_ETH)
                .div(pos.margin.d.add(posNotionalNPnl.unrealizedPnl.d))
            const liquidationPrice = getLiquidationPrice(
                leverage,
                pos.margin.d,
                pos.openNotional.d,
                pos.size.d,
                MAINTENANCE_MARGIN_RATIO,
                k,
            )

            console.log(chalk.green(`${priceFeedKey}/USDC`))
            console.log(formatProperty("position size", utils.formatEther(pos.size.d)))
            console.log(formatProperty("margin (with funding payment)", utils.formatEther(pos.margin.d)))
            console.log(formatProperty("margin ratio", utils.formatEther(marginRatio.d.mul("100")) + " %"))
            console.log(formatProperty("leverage", utils.formatEther(leverage)))
            console.log(formatProperty("pnl", utils.formatEther(posNotionalNPnl.unrealizedPnl.d)))
            console.log(formatProperty("liq. price", utils.formatEther(liquidationPrice)))
            console.log(formatProperty("open notional", utils.formatEther(pos.openNotional.d)))
            console.log(formatProperty("last open at block", pos.blockNumber))
            console.log("")
        }
    },
}

export default portfolioCommand
