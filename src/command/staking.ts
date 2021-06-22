import { Layer, getProvider } from "../util/provider"
import { fetchConfiguration, fetchMetadata } from "../util/metadata"

import { BaseLogger } from "../cli/middeware"
import { CommandModule } from "yargs"
import { PerpRewardVesting } from "../type"
import PerpRewardVestingArtifact from "@perp/contract/build/contracts/src/staking/PerpRewardVesting.sol/PerpRewardVesting.json"
import { getContract } from "../util/contract"
import { getStageName } from "../util/stage"

const stakingCommand: CommandModule = {
    command: "staking",
    describe: "show current staking status",
    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const config = await fetchConfiguration(stageName)
        const metadata = await fetchMetadata(stageName)

        const provider = getProvider(Layer.Layer1, config)
        const layer1Contracts = metadata.layers.layer1.contracts

        const logger = argv.logger as BaseLogger
        const { log } = logger

        const perpStakingRewardVesting = getContract<PerpRewardVesting>(
            layer1Contracts.PerpStakingRewardVesting.address,
            PerpRewardVestingArtifact.abi,
            provider,
        )
        const weekLength = await perpStakingRewardVesting.getLengthOfMerkleRoots()

        log(`The last week number of seed allocation: ${weekLength}`)
        log(`The next week number of seed allocation: ${weekLength.add(1)}`)
    },
}

export default stakingCommand
