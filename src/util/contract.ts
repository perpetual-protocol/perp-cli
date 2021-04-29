import { Fragment, JsonFragment } from "@ethersproject/abi"
import { Contract, providers } from "ethers"

export function getContract<T>(
    address: string,
    abi: Array<string | Fragment | JsonFragment>,
    provider: providers.Provider,
): T {
    return (new Contract(address, abi, provider) as unknown) as T
}
