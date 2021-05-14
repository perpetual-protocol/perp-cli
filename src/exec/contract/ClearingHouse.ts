import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../../type"
import { getContract } from "../../util/contract"
import { Metadata } from "../../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { BigNumber, utils } from "ethers"
import { formatError, formatProperty } from "../../util/format"
import { EmptyArg } from "../../util/functionsMap"
import { getSuggestedGas } from "../../util/provider"

export class OpenPositionArg implements EmptyArg {
    constructor(
        readonly amm: string,
        readonly side: number,
        readonly quoteAssetAmount: string,
        readonly leverage: string,
        readonly baseAssetAmountLimit: string,
    ) {}

    verify() {
        if (
            this.amm === undefined ||
            this.side === undefined ||
            this.leverage === undefined ||
            this.baseAssetAmountLimit === undefined ||
            this.quoteAssetAmount === undefined
        ) {
            console.log(formatError("args for openPosition are incomplete"))
            throw ""
        }

        if (!verifyAddress(this.amm.toString())) {
            console.log(formatError("invalid address format"))
            throw ""
        }
        if (!(this.side == 0 || this.side == 1)) {
            console.log(formatError("invalid `Side`"))
            throw ""
        }
    }
}

export class ClosePositionArg implements EmptyArg {
    constructor(readonly amm: string, readonly quoteAssetAmountLimit: string) {}

    verify() {
        if (this.quoteAssetAmountLimit === undefined || this.amm === undefined) {
            console.log(formatError("args for closePosition are incomplete"))
            throw ""
        }

        if (!verifyAddress(this.amm.toString())) {
            console.log(formatError("invalid address format"))
            throw ""
        }
    }
}

export async function openPosition(meta: Metadata, signer: Signer, args: OpenPositionArg): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const openPositionArgs = new OpenPositionArg(
        args.amm,
        args.side,
        args.quoteAssetAmount,
        args.leverage,
        args.baseAssetAmountLimit,
    )
    openPositionArgs.verify()

    const gasLimit = await getSuggestedGas(
        clearingHouse,
        "openPosition",
        [
            openPositionArgs.amm,
            openPositionArgs.side,
            { d: utils.parseEther(openPositionArgs.quoteAssetAmount.toString()) },
            { d: utils.parseEther(openPositionArgs.leverage.toString()) },
            { d: utils.parseEther(openPositionArgs.baseAssetAmountLimit.toString()) },
        ],
        await signer.getAddress(),
    )

    const options = { gasLimit: gasLimit }
    const tx = await (
        await clearingHouse
            .connect(signer)
            .openPosition(
                openPositionArgs.amm,
                openPositionArgs.side,
                { d: utils.parseEther(openPositionArgs.quoteAssetAmount.toString()) },
                { d: utils.parseEther(openPositionArgs.leverage.toString()) },
                { d: utils.parseEther(openPositionArgs.baseAssetAmountLimit.toString()) },
                options,
            )
    ).wait()

    const pos = await clearingHouse.getPosition(openPositionArgs.amm, await signer.getAddress())
    console.log(formatProperty("position size:", utils.formatEther(pos.size.d)))

    return tx
}

export async function closePosition(
    meta: Metadata,
    signer: Signer,
    args: ClosePositionArg,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const closePositionArgs = new ClosePositionArg(args.amm, args.quoteAssetAmountLimit)
    closePositionArgs.verify()

    const gasLimit = await getSuggestedGas(
        clearingHouse,
        "closePosition",
        [closePositionArgs.amm, { d: utils.parseEther(closePositionArgs.quoteAssetAmountLimit.toString()) }],
        await signer.getAddress(),
    )
    const options = { gasLimit: gasLimit }
    return await (
        await clearingHouse.connect(signer).closePosition(
            closePositionArgs.amm,
            {
                d: utils.parseEther(closePositionArgs.quoteAssetAmountLimit.toString()),
            },
            options,
        )
    ).wait()
}

// Naive way to prevent from address not embedded by "" in yml file
function verifyAddress(addr: string): boolean {
    return addr.startsWith("0x") ? true : false
}
