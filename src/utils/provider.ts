import { providers } from "ethers"

export function getProvider(): providers.Provider {
    return new providers.WebSocketProvider("wss://xdai.perp.fi:30685/")
}
