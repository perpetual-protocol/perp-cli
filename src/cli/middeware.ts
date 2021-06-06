import { Arguments } from "yargs"
import chalk from "chalk"

export function LoggerMiddleware(argv: Arguments) {
    const isCLI = argv.commandline as boolean

    let logger: BaseLogger
    if (isCLI) {
        logger = new CommandlineLogger(console.log)
    } else {
        if (!argv.respond) {
            throw new Error(`BotLogger Error: should pass \`respond()\` property into argv context`)
        } else {
            // @ts-ignore
            logger = new BotLogger(argv.respond)
        }
    }
    argv.logger = logger
}

type logFn = (str: string) => void

export class BaseLogger {
    readonly log: logFn

    constructor(fn: logFn) {
        if (!fn) {
            throw new Error(`BaseLogger: required logFn when initialize`)
        }
        this.log = fn
    }

    formatTitle(title: string) {
        return title
    }

    formatProperty(key: string, value: any) {
        return `- ${key}: ${value}`
    }

    formatInfo(msg: any) {
        return msg
    }

    formatError(msg: any) {
        return `\nERROR! "${msg}"\n`
    }

    info() {
        // NOTE: add this functionality if needed
    }

    error() {
        // NOTE: add this functionality if needed
    }

    warning() {
        // NOTE: add this functionality if needed
    }
}

class BotLogger extends BaseLogger {
    // NOTE: add any customization for BotLogger here
}

class CommandlineLogger extends BaseLogger {
    formatTitle(title: string) {
        return chalk.green(title)
    }

    formatProperty(key: string, value: any) {
        return chalk.yellow(`- ${key}: `) + `${value}`
    }

    formatInfo(msg: any) {
        return chalk.yellow(msg)
    }

    formatError(msg: any) {
        return chalk.red(`\nERROR! "${msg}"\n`)
    }
}
