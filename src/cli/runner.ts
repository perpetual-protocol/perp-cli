import yargs from "yargs"
import positionHistory from "../command/position"
import ammStatus from "../command/amm"
import portfolio from "../command/portfolio"
import verifyCommand from "../command/verify"
import sendTx from "../command/exec"
import { LoggerMiddleware } from "./middeware"

const SCRIPT_NAME = "perp"

export function runner() {
    return yargs
        .scriptName(SCRIPT_NAME)
        .option("stage", {
            type: "string",
            default: "production",
        })
        .option("commandline", {
            type: "boolean",
            default: "true"
        })
        .command(positionHistory)
        .command(ammStatus)
        .command(portfolio)
        .command(verifyCommand)
        .command(sendTx)
        .demandCommand(1)
        .middleware([LoggerMiddleware])
        .help()
}
