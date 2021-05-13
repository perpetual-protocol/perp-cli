import { providers } from "ethers"
import { Configuration } from "./metadata"

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
