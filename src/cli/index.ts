#!/usr/bin/env node

import { runner } from "./runner"
import { hideBin } from "yargs/helpers"

runner()
    .onFinishCommand(() => process.exit(0))
    .parse(hideBin(process.argv))
