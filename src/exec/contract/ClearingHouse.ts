import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../../type"
import { getContract } from "../../util/contract"
import { Metadata } from "../../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { Overrides, utils, ethers } from "ethers"
import { formatError, formatProperty } from "../../util/format"
import { BaseArgs, Options } from "../../util/functionsMap"
import { getSuggestedGas } from "../../util/provider"
import { throwError } from "../../util/utils"

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
            throwError("args for openPosition are incomplete")
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            throwError("invalid address format")
        }
        if (!(this.side == 0 || this.side == 1)) {
            throwError("invalid `Side`")
        }
    }
}

export class ClosePositionArgs implements BaseArgs {
    constructor(readonly amm: string, readonly quoteAssetAmountLimit: string) {}

    verify() {
        if (this.quoteAssetAmountLimit === undefined || this.amm === undefined) {
            throwError("args for closePosition are incomplete")
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            throwError("invalid address format")
        }
    }
}

export class AddMarginArgs implements BaseArgs {
    constructor(readonly amm: string, readonly addedMargin: string) {}

    verify() {
        if (this.addedMargin === undefined || this.amm === undefined) {
            throwError("args for AddMarginArgs are incomplete")
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            throwError("invalid address format")
        }
    }
}

export class RemoveMarginArgs implements BaseArgs {
    constructor(readonly amm: string, readonly removedMargin: string) {}

    verify() {
        if (this.removedMargin === undefined || this.amm === undefined) {
            throwError("args for RemoveMarginArgs are incomplete")
        }

        if (!ethers.utils.isAddress(this.amm.toString())) {
            throwError("invalid address format")
        }
    }
}

export async function openPosition(
    meta: Metadata,
    signer: Signer,
    args: OpenPositionArgs,
    options: Options,
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

    if (options.gasLimit === undefined) {
        options.gasLimit = await getSuggestedGas(
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
    args: ClosePositionArgs,
    options: Options,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const closePositionArgs = new ClosePositionArgs(args.amm, args.quoteAssetAmountLimit)
    closePositionArgs.verify()

    if (options.gasLimit === undefined) {
        options.gasLimit = await getSuggestedGas(
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
            options,
        )
    ).wait()
}

export async function addMargin(
    meta: Metadata,
    signer: Signer,
    args: AddMarginArgs,
    options: Options,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const addMarginArgs = new AddMarginArgs(args.amm, args.addedMargin)
    addMarginArgs.verify()

    if (options.gasLimit === undefined) {
        options.gasLimit = await getSuggestedGas(
            clearingHouse,
            "addMargin",
            [addMarginArgs.amm, { d: utils.parseEther(addMarginArgs.addedMargin.toString()) }],
            await signer.getAddress(),
        )
    }

    return await (
        await clearingHouse.connect(signer).addMargin(
            addMarginArgs.amm,
            {
                d: utils.parseEther(addMarginArgs.addedMargin.toString()),
            },
            options,
        )
    ).wait()
}

export async function removeMargin(
    meta: Metadata,
    signer: Signer,
    args: RemoveMarginArgs,
    options: Options,
): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const removeMarginArgs = new RemoveMarginArgs(args.amm, args.removedMargin)
    removeMarginArgs.verify()

    if (options.gasLimit === undefined) {
        options.gasLimit = await getSuggestedGas(
            clearingHouse,
            "removeMargin",
            [removeMarginArgs.amm, { d: utils.parseEther(removeMarginArgs.removedMargin.toString()) }],
            await signer.getAddress(),
        )
    }

    return await (
        await clearingHouse.connect(signer).removeMargin(
            removeMarginArgs.amm,
            {
                d: utils.parseEther(removeMarginArgs.removedMargin.toString()),
            },
            options,
        )
    ).wait()
}
