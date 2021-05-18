import { BigNumber, providers } from "ethers"
import { Configuration } from "./metadata"
import { Contract } from "@ethersproject/contracts"

export enum Layer {
    Layer1 = "layer1",
    Layer2 = "layer2",
}

export enum NetworkName {
    Homestead = "homestead",
    Rinkeby = "rinkeby",
    Xdai = "xdai",
}

export function getProvider(layer: Layer, config: Configuration): providers.Provider {
    if (layer === Layer.Layer1 && config.L1_WEB3_ENDPOINTS.length > 0) {
        return new providers.WebSocketProvider(config.L1_WEB3_ENDPOINTS[0].url)
    } else if (layer === Layer.Layer2 && config.L2_WEB3_ENDPOINTS.length > 0) {
        return new providers.WebSocketProvider(config.L2_WEB3_ENDPOINTS[0].url)
    } else {
        throw new Error("provider not exists")
    }
}

export async function getSuggestedGas(
    contract: Contract,
    funcName: string,
    args: any[],
    account: string,
): Promise<BigNumber> {
    const gasLimit = await contract.estimateGas[funcName](...args, { from: account })
    // multiple estimated gas usage by 1.5
    return gasLimit.mul(15).div(10)
}
