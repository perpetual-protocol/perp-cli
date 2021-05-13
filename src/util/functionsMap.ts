import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../type"
import { getContract } from "./contract"
import { Layer } from "../util/provider"
import { Metadata } from "../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { utils } from "ethers"
import { formatProperty } from "./format"

export interface Actions {
    action: string
    args: string
}

//
// Declaration of function arguments
//
export interface EmptyArg {}

export interface OpenPositionArg extends EmptyArg {
    amm: string
    side: string
    quoteAssetAmount: string
    leverage: string
    baseAssetAmountLimit: string
}

export interface ClosePositionArg extends EmptyArg {
    amm: string
    quoteAssetAmountLimit: string
}

export interface actionOfFunction {
    openPosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
    closePosition: (meta: Metadata, signer: Signer, args: EmptyArg) => Promise<TransactionReceipt>
}

//
// implementation of executing functions
//

export const actionMaps: actionOfFunction = {
    openPosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        const clearingHouse = getContract<ClearingHouse>(
            meta.layers.layer2.contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            signer,
        ) as ClearingHouse
        const openPositionArgs = args as OpenPositionArg
        const tx = await (
            await clearingHouse
                .connect(signer)
                .openPosition(
                    openPositionArgs.amm,
                    openPositionArgs.side,
                    { d: utils.parseEther(openPositionArgs.quoteAssetAmount.toString()) },
                    { d: utils.parseEther(openPositionArgs.leverage.toString()) },
                    { d: utils.parseEther(openPositionArgs.baseAssetAmountLimit.toString()) },
                )
        ).wait()

        const pos = await clearingHouse.getPosition(openPositionArgs.amm, await signer.getAddress())
        console.log(formatProperty("position size:", utils.formatEther(pos.size.d)))

        return tx
    },
    closePosition: async (meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> => {
        const clearingHouse = getContract<ClearingHouse>(
            meta.layers.layer2.contracts.ClearingHouse.address,
            ClearingHouseArtifact.abi,
            signer,
        ) as ClearingHouse
        const closePositionArgs = args as ClosePositionArg
        return await (
            await clearingHouse
                .connect(signer)
                .closePosition(closePositionArgs.amm, { d: closePositionArgs.quoteAssetAmountLimit })
        ).wait()
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
