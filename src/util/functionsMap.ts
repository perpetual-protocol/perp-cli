import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { BigNumber, Overrides } from "ethers"
import { Layer } from "../util/provider"
import { Metadata } from "../util/metadata"
import { closePosition, openPosition, OpenPositionArgs, ClosePositionArgs } from "../exec/contract/ClearingHouse"

export interface Action {
    action: string
    args: BaseArgs
    options?: Options
}

export interface Options {
    gasPrice: BigNumber | undefined
    gasLimit: BigNumber | undefined
}

export interface BaseArgs {
    verify: () => void
}

export interface actionOfFunction {
    openPosition: (meta: Metadata, signer: Signer, args: BaseArgs, options: Options) => Promise<TransactionReceipt>
    closePosition: (meta: Metadata, signer: Signer, args: BaseArgs, options: Options) => Promise<TransactionReceipt>
}

export const actionMaps: actionOfFunction = {
    openPosition: async (
        meta: Metadata,
        signer: Signer,
        args: BaseArgs,
        options: Options,
    ): Promise<TransactionReceipt> => {
        return openPosition(meta, signer, args as OpenPositionArgs, options)
    },

    closePosition: async (
        meta: Metadata,
        signer: Signer,
        args: BaseArgs,
        options: Options,
    ): Promise<TransactionReceipt> => {
        return closePosition(meta, signer, args as ClosePositionArgs, options)
    },
}

export function layerOfFunction(func: string): Layer {
    switch (func) {
        case "openPosition":
        case "closePosition":
            return Layer.Layer2

        default:
            return Layer.Layer2
    }
}
