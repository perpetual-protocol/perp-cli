import { IERC20, PerpRewardVesting } from "../type"
import { Layer, getProvider } from "../util/provider"
import { fetchConfiguration, fetchMetadata } from "../util/metadata"

import { BaseLogger } from "../cli/middeware"
import { CommandModule } from "yargs"
import ERC20ViewOnlyArtifact from "@perp/contract/build/contracts/src/utils/ERC20ViewOnly.sol/ERC20ViewOnly.json"
import PerpRewardVestingArtifact from "@perp/contract/build/contracts/src/staking/PerpRewardVesting.sol/PerpRewardVesting.json"
import { commify } from "ethers/lib/utils"
import { getContract } from "../util/contract"
import { getStageName } from "../util/stage"
import { toNumber } from "../util/casting"

const stakingCommand: CommandModule = {
    command: "staking",
    describe: "show current staking status",
    handler: async argv => {
        const stageName = getStageName(argv.stage)
        const config = await fetchConfiguration(stageName)
        const metadata = await fetchMetadata(stageName)

        const provider = getProvider(Layer.Layer1, config)
        const layer1Contracts = metadata.layers.layer1.contracts
        const layer1ExternalContracts = metadata.layers.layer1.externalContracts

        const logger = argv.logger as BaseLogger
        const { log } = logger

        const perpStakingRewardVesting = getContract<PerpRewardVesting>(
            layer1Contracts.PerpStakingRewardVesting.address,
            PerpRewardVestingArtifact.abi,
            provider,
        )
        const weekLength = await perpStakingRewardVesting.getLengthOfMerkleRoots()

        log(`The last week number of seed allocation: ${weekLength}`)
        log(`The next week number of seed allocation: ${weekLength.add(1)}\n`)

        const perpContract = getContract<IERC20>(layer1ExternalContracts.perp, ERC20ViewOnlyArtifact.abi, provider)

        const balance = await perpContract.balanceOf(layer1ExternalContracts.rewardGovernance)
        log(`PERP balance of reward governance: ${commify(toNumber(balance, 18))}\n`)

        const owner = layer1ExternalContracts.rewardGovernance
        const allowanceVesting = await perpContract.allowance(owner, layer1Contracts.PerpStakingRewardVesting.address)
        const allowanceNoVesting = await perpContract.allowance(
            owner,
            layer1Contracts.PerpStakingRewardNoVesting.address,
        )
        log(`PERP staking reward vesting allowance: ${commify(toNumber(allowanceVesting))}`)
        log(`PERP staking reward noVesting allowance: ${commify(toNumber(allowanceNoVesting))}`)
    },
}

export default stakingCommand
