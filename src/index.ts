#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import positionHistory from "./command/position"
import ammStatus from "./command/amm"
import portfolio from "./command/portfolio"
import verifyCommand from "./command/verify"

const SCRIPT_NAME = "perp"

yargs(hideBin(process.argv))
    .scriptName(SCRIPT_NAME)
    .option("stage", {
        type: "string",
        default: "production",
    })
    .command(positionHistory)
    .command(ammStatus)
    .command(portfolio)
    .command(verifyCommand)
    .onFinishCommand(_ => {
        process.exit(0)
    })
    .demandCommand(1).argv
