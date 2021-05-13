import ClearingHouseArtifact from "@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json"

import { ClearingHouse } from "../../type"
import { getContract } from "../../util/contract"
import { Metadata } from "../../util/metadata"

import { Signer } from "@ethersproject/abstract-signer"
import { TransactionReceipt } from "@ethersproject/abstract-provider"
import { utils } from "ethers"
import { formatError, formatProperty } from "../../util/format"
import { EmptyArg } from "../../util/functionsMap"

export interface OpenPositionArg extends EmptyArg {
    amm: string
    side: number
    quoteAssetAmount: string
    leverage: string
    baseAssetAmountLimit: string

    // TODO add a verifier
}

export interface ClosePositionArg extends EmptyArg {
    amm: string
    quoteAssetAmountLimit: string
}

export async function openPosition(meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const openPositionArgs = args as OpenPositionArg

    if (!verifyAddress(openPositionArgs.amm.toString())) {
        console.log(formatError("invalid address format"))
        throw ""
    }
    if (!(openPositionArgs.side == 0 || openPositionArgs.side == 1)) {
        console.log(formatError("invalid `Side`"))
        throw ""
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
            )
    ).wait()

    const pos = await clearingHouse.getPosition(openPositionArgs.amm, await signer.getAddress())
    console.log(formatProperty("position size:", utils.formatEther(pos.size.d)))

    return tx
}

export async function closePosition(meta: Metadata, signer: Signer, args: EmptyArg): Promise<TransactionReceipt> {
    const clearingHouse = getContract<ClearingHouse>(
        meta.layers.layer2.contracts.ClearingHouse.address,
        ClearingHouseArtifact.abi,
        signer,
    ) as ClearingHouse
    const closePositionArgs = args as ClosePositionArg
    if (!verifyAddress(closePositionArgs.amm.toString())) {
        console.log(formatError("invalid address format"))
        throw ""
    }
    return await (
        await clearingHouse.connect(signer).closePosition(closePositionArgs.amm, {
            d: utils.parseEther(closePositionArgs.quoteAssetAmountLimit.toString()),
        })
    ).wait()
}

function verifyAddress(addr: string): boolean {
    return addr.startsWith("0x") ? true : false
}
