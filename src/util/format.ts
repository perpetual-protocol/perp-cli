import { BigNumber } from "@ethersproject/bignumber"
import chalk from "chalk"
import { utils } from "ethers"
import { DEFAULT_DECIMALS } from "./casting"

interface Stringify {
    toString(): string
}

export function formatTitle(title: string) {
    return chalk.green(title)
}

export function formatProperty(key: string, value: any) {
    return chalk.yellow(`- ${key}: `) + value
}

export function formatInfo(msg: any) {
    return chalk.yellow(msg)
}

export function formatError(msg: any) {
    return chalk.red(`\nERROR! "${msg}"\n`)
}

export function formatDecimal(num: Stringify, decimals = DEFAULT_DECIMALS): string {
    const value = Number.parseFloat(utils.formatUnits(num.toString(), decimals))
    return Intl.NumberFormat("en-US").format(value)
}

export function formatBigNumber(num: BigNumber): string {
    return `${num.toString()} (${formatDecimal(num)})`
}

export function formatArray(inArray: any[]): any[] {
    const outArray: any[] = []
    for (const arg of inArray) {
        if (Array.isArray(arg)) {
            outArray.push(formatArray(arg))
        } else if (BigNumber.isBigNumber(arg)) {
            outArray.push(formatBigNumber(arg))
        } else {
            outArray.push(arg)
        }
    }

    return outArray
}
