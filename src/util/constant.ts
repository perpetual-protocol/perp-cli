import { BigNumber, utils } from "ethers"

export enum Dir {
    ADD_TO_AMM = "0",
    REMOVE_FROM_AMM = "1",
}
export enum PnlCalcOption {
    SPOT_PRICE,
    TWAP,
    ORACLE,
}

// maintenance margin ratio: 6.25%
export const MAINTENANCE_MARGIN_RATIO: BigNumber = utils.parseEther("1").mul(625).div(10000)

export const PERP_MNEMONIC = `${process.env["PERP_MNEMONIC"]}`
