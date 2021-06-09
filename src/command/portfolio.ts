import TetherTokenArtifact from "@perp/contract/build/contracts/src/mock/TetherToken.sol/TetherToken.json"
import AmmArtifact from "@perp/contract/build/contracts/src/Amm.sol/Amm.json"
import InsuranceFundArtifact from "@perp/contract/build/contracts/src/InsuranceFund.sol/InsuranceFund.json"
import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"
import ClearingHouseViewerArtifact from "@perp/contract/build/contracts/src/ClearingHouseViewer.sol/ClearingHouseViewer.json"
import { utils } from "ethers"
import { CommandModule } from "yargs"
import { fetchConfiguration, fetchMetadata } from "../util/metadata"
import { getProvider, Layer } from "../util/provider"
import { getStageName } from "../util/stage"
import { InsuranceFund, Amm, ClearingHouse, ClearingHouseViewer, TetherToken } from "../type"
import { getLiquidationPrice } from "../util/calculation"
import { ONE_ETH } from "../util/dataTypes"
import { PnlCalcOption, MAINTENANCE_MARGIN_RATIO } from "../util/constant"
import { balanceOf, getContract } from "../util/contract"
import { BaseLogger } from "../cli/middeware"

const portfolioCommand: CommandModule = {
    command: "portfolio <trader_addr>",
    describe: "show trader's portfolio",
    builder: yargs =>
        yargs.positional("trader_addr", {
            describe: "trader's address",
            type: "string",
        }),

    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const metadata = await fetchMetadata(stageName)
        const config = await fetchConfiguration(stageName)
        const layer2provider = getProvider(Layer.Layer2, config)
        const layer1provider = getProvider(Layer.Layer1, config)
        const layer2Contracts = metadata.layers.layer2.contracts
        const layer1Contracts = metadata.layers.layer1.contracts
        const trader = argv.trader_addr as string
        const logger = argv.logger as BaseLogger
        const { formatTitle, formatProperty, log } = logger

        const layer1Usdc = getContract<TetherToken>(
            metadata.layers.layer1.externalContracts.usdc,
            TetherTokenArtifact.abi,
            layer1provider,
        )
        const layer2Usdc = getContract<TetherToken>(
            metadata.layers.layer2.externalContracts.usdc,
            TetherTokenArtifact.abi,
            layer2provider,
        )

        const insuranceFund = getContract<InsuranceFund>(
            layer2Contracts.InsuranceFund.address,
            InsuranceFundArtifact.abi,
            layer2provider,
        )

        const clearingHouse = getContract<ClearingHouse>(
            layer2Contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            layer2provider,
        )

        const clearingHouseViewer = getContract<ClearingHouseViewer>(
            layer2Contracts.ClearingHouseViewer.address,
            ClearingHouseViewerArtifact.abi,
            layer2provider,
        )

        const layer1Balance = await balanceOf(trader, layer1Usdc)
        const layer2Balance = await balanceOf(trader, layer2Usdc)
        const symbol = await layer1Usdc.symbol()

        log(formatTitle("Balances"))
        log(formatProperty("layer1", `${layer1Balance} ${symbol}`))
        log(formatProperty("layer2", `${layer2Balance} ${symbol}`))
        log("")

        const ammAddressList = await insuranceFund.getAllAmms()
        for (const addr of ammAddressList) {
            const pos = await clearingHouseViewer.getPersonalPositionWithFundingPayment(addr, trader)
            if (pos.size.d.isZero()) {
                continue
            }
            const amm = getContract<Amm>(addr, AmmArtifact.abi, layer2provider)
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

            log(formatTitle(`${priceFeedKey}/${symbol}`))
            log(formatProperty("position size", utils.formatEther(pos.size.d)))
            log(formatProperty("margin (with funding payment)", utils.formatEther(pos.margin.d)))
            log(formatProperty("margin ratio", utils.formatEther(marginRatio.d.mul("100")) + " %"))
            log(formatProperty("leverage", utils.formatEther(leverage)))
            log(formatProperty("pnl", utils.formatEther(posNotionalNPnl.unrealizedPnl.d)))
            log(formatProperty("liq. price", utils.formatEther(liquidationPrice)))
            log(formatProperty("open notional", utils.formatEther(pos.openNotional.d)))
            log(formatProperty("last open at block", pos.blockNumber))
            log("")
        }
    },
}

export default portfolioCommand
