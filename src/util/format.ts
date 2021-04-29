import { BigNumber } from "@ethersproject/bignumber"
import chalk from "chalk"
import { utils } from "ethers"
import { DEFAULT_DECIMALS } from "./casting"

interface Stringify {
    toString(): string
}

export function formatProperty(key: string, value: any) {
    return chalk.yellow(`- ${key}: `) + value
}

export function formatDecimal(num: Stringify, decimals = DEFAULT_DECIMALS): string {
    return utils.formatUnits(num.toString(), decimals)
}
