import { BigNumber, utils } from "ethers"
import Big from "big.js"

export const DIGIT_OF_ETH = 18
export const ONE_ETH: BigNumber = utils.parseEther("1")

export interface Decimal {
    d: BigNumber
}

export function bigNum2Big(val: BigNumber, decimals: number = DIGIT_OF_ETH): Big {
    return new Big(val.toString()).div(new Big(10).pow(decimals))
}

export function big2BigNum(val: Big, decimals: number = DIGIT_OF_ETH): BigNumber {
    return BigNumber.from(val.mul(new Big(10).pow(decimals)).toFixed(0))
}

export function decimal2Big(decimal: Decimal): Big {
    return bigNum2Big(decimal.d)
}
