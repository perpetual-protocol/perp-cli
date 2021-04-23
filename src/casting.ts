import { formatUnits } from "@ethersproject/units"
import { BigNumber } from "ethers"

export const DEFAULT_DECIMALS = 18

export function toNumber(val: BigNumber, decimals = DEFAULT_DECIMALS) {
    return Number.parseFloat(formatUnits(val, decimals))
}
