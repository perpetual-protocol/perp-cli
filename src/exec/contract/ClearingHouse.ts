import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../../type"
import { getContract } from "../../util/contract"
import { Metadata } from "../../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { Overrides, utils, ethers } from "ethers"
import { formatError, formatProperty } from "../../util/format"
import { BaseArgs } from "../../util/functionsMap"
import { getSuggestedGas } from "../../util/provider"

export class OpenPositionArgs implements BaseArgs {
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
            const error = "args for openPosition are incomplete"
            console.log(formatError(error))
            throw new Error(error)
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            const error = "invalid address format"
            console.log(formatError(error))
            throw new Error(error)
        }
        if (!(this.side == 0 || this.side == 1)) {
            const error = "invalid `Side`"
            console.log(formatError(error))
            throw new Error(error)
        }
    }
}

export class ClosePositionArgs implements BaseArgs {
    constructor(readonly amm: string, readonly quoteAssetAmountLimit: string) {}

    verify() {
        if (this.quoteAssetAmountLimit === undefined || this.amm === undefined) {
            const error = "args for closePosition are incomplete"
            console.log(formatError(error))
            throw new Error(error)
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            const error = "invalid address format"
            console.log(formatError(error))
            throw new Error(error)
        }
    }
}

export async function openPosition(
    meta: Metadata,
    signer: Signer,
    args: OpenPositionArgs,
    overrides: Overrides,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const openPositionArgs = new OpenPositionArgs(
        args.amm,
        args.side,
        args.quoteAssetAmount,
        args.leverage,
        args.baseAssetAmountLimit,
    )
    openPositionArgs.verify()

    if (overrides.gasLimit === undefined) {
        overrides.gasLimit = await getSuggestedGas(
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
    }

    const tx = await (
        await clearingHouse
            .connect(signer)
            .openPosition(
                openPositionArgs.amm,
                openPositionArgs.side,
                { d: utils.parseEther(openPositionArgs.quoteAssetAmount.toString()) },
                { d: utils.parseEther(openPositionArgs.leverage.toString()) },
                { d: utils.parseEther(openPositionArgs.baseAssetAmountLimit.toString()) },
                overrides,
            )
    ).wait()

    const pos = await clearingHouse.getPosition(openPositionArgs.amm, await signer.getAddress())
    console.log(formatProperty("position size:", utils.formatEther(pos.size.d)))

    return tx
}

export async function closePosition(
    meta: Metadata,
    signer: Signer,
    args: ClosePositionArgs,
    overrides: Overrides,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const closePositionArgs = new ClosePositionArgs(args.amm, args.quoteAssetAmountLimit)
    closePositionArgs.verify()

    if (overrides.gasLimit === undefined) {
        overrides.gasLimit = await getSuggestedGas(
            clearingHouse,
            "closePosition",
            [closePositionArgs.amm, { d: utils.parseEther(closePositionArgs.quoteAssetAmountLimit.toString()) }],
            await signer.getAddress(),
        )
    }

    return await (
        await clearingHouse.connect(signer).closePosition(
            closePositionArgs.amm,
            {
                d: utils.parseEther(closePositionArgs.quoteAssetAmountLimit.toString()),
            },
            overrides,
        )
    ).wait()
}
