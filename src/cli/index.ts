#!/usr/bin/env node

import { runner } from "./runner"
import { hideBin } from "yargs/helpers"
import { Arguments } from "yargs"

runner().parseAsync(
    hideBin(process.argv),
    (err: Error | undefined, argv: Arguments | Promise<Arguments>, output: string) => {
        if (err || output) {
            console.log(output)
        }
        process.exit(0)
    },
)
