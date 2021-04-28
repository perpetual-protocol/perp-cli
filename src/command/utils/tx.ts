import { Fragment, JsonFragment } from "@ethersproject/abi"
import { Contract, providers } from "ethers"

export function instance(
    address: string,
    abi: Array<string | Fragment | JsonFragment>,
    provider: providers.Provider,
): Contract {
    return new Contract(address, abi, provider) as Contract
}
