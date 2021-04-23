import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import positionHistory from "./command/position"

const SCRIPT_NAME = "perp"

yargs(hideBin(process.argv))
    .scriptName(SCRIPT_NAME)
    .command(positionHistory)
    .onFinishCommand(_ => {
        process.exit(0)
    })
    .demandCommand(1).argv
