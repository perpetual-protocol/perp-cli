import { LoggerMiddleware } from "./middeware"
import ammStatus from "../command/amm"
import portfolio from "../command/portfolio"
import positionHistory from "../command/position"
import sendTx from "../command/exec"
import staking from "../command/staking"
import verifyCommand from "../command/verify"
import yargs from "yargs"

const SCRIPT_NAME = "perp"

export function runner() {
    return yargs
        .scriptName(SCRIPT_NAME)
        .options({
            stage: {
                type: "string",
                default: "production",
            },
            commandline: {
                type: "boolean",
                default: "true",
            },
            "layer1-rpc-url": {
                type: "string",
                default: "",
                description: "https json rpc url for layer 1",
            },
            "layer2-rpc-url": {
                type: "string",
                default: "",
                description: "https json rpc url for layer 2",
            },
        })
        .command(positionHistory)
        .command(ammStatus)
        .command(portfolio)
        .command(verifyCommand)
        .command(sendTx)
        .command(staking)
        .demandCommand(1)
        .middleware([LoggerMiddleware])
        .help()
}
