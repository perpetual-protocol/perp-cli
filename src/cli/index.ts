#!/usr/bin/env node

import { runner } from "./runner"
import { hideBin } from "yargs/helpers"

runner().parse(hideBin(process.argv))
