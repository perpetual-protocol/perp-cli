#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import positionHistory from "./command/position"
import ammStatus from "./command/amm"
import portfolio from "./command/portfolio"

const SCRIPT_NAME = "perp"

yargs(hideBin(process.argv))
    .scriptName(SCRIPT_NAME)
    .command(positionHistory)
    .command(ammStatus)
    .command(portfolio)
    .onFinishCommand(_ => {
        process.exit(0)
    })
    .demandCommand(1).argv
