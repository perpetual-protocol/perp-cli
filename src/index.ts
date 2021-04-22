import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import historyCommand from "./command/history"

const SCRIPT_NAME = "perp"

yargs(hideBin(process.argv)).scriptName(SCRIPT_NAME).command(historyCommand).demandCommand(1).argv
