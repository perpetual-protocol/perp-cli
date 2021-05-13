import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../type"
import { getContract } from "./contract"
import { Layer } from "../util/provider"
import { Metadata } from "../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { utils } from "ethers"
import { formatError, formatProperty } from "./format"
import { exit } from "yargs"
import { closePosition, openPosition } from "../exec/contract/ClearingHouse"

export interface Actions {
    action: string
    args: string
}

export interface EmptyArg {}

export interface actionOfFunction {
    openPosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
    closePosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
}

export const actionMaps: actionOfFunction = {
    openPosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        return openPosition(meta, signer, args)
    },

    closePosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        return closePosition(meta, signer, args)
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
