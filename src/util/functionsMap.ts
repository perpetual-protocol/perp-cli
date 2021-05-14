import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { Layer } from "../util/provider"
import { Metadata } from "../util/metadata"
import { closePosition, openPosition, OpenPositionArg, ClosePositionArg } from "../exec/contract/ClearingHouse"

export interface Actions {
    action: string
    args: EmptyArg
}

export interface EmptyArg {
    verify: () => void
}

export interface actionOfFunction {
    openPosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
    closePosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
}

export const actionMaps: actionOfFunction = {
    openPosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        return openPosition(meta, signer, args as OpenPositionArg)
    },

    closePosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        return closePosition(meta, signer, args as ClosePositionArg)
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
