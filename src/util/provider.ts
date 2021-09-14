import { BigNumber, getDefaultProvider, providers } from "ethers"
import { Configuration } from "./metadata"
import { Contract } from "@ethersproject/contracts"
import { Arguments } from "yargs"

export enum Layer {
    Layer1 = "layer1",
    Layer2 = "layer2",
}

export enum NetworkName {
    Homestead = "homestead",
    Rinkeby = "rinkeby",
    Xdai = "xdai",
}

function getLayer1Provider(argv: Arguments) {
    const layer1RpcUrl = argv.layer1RpcUrl as string

    return layer1RpcUrl ? new providers.JsonRpcProvider(layer1RpcUrl) : getDefaultProvider()
}

function getLayer2Provider(config: Configuration, argv: Arguments) {
    const layer2RpcUrl = argv.layer2RpcUrl as string
    const wsUrlFromConfig = config.L2_WEB3_ENDPOINTS[0]?.url

    if (layer2RpcUrl) {
        return new providers.JsonRpcProvider(layer2RpcUrl)
    } else if (wsUrlFromConfig) {
        return new providers.WebSocketProvider(wsUrlFromConfig)
    } else {
        throw new Error("layer 2 provider not exists")
    }
}

export function getProvider(layer: Layer, config: Configuration, argv: Arguments): providers.Provider {
    if (layer === Layer.Layer1) {
        return getLayer1Provider(argv)
    } else if (layer === Layer.Layer2) {
        return getLayer2Provider(config, argv)
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
