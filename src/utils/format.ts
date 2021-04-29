import chalk from "chalk"

export function formatProperty(key: string, value: any) {
    return chalk.yellow(`- ${key}: `) + value
}
