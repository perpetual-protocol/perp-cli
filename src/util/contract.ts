import { Fragment, JsonFragment } from "@ethersproject/abi"
import { Contract, providers, utils } from "ethers"
import { TetherToken } from "../type"

export function getContract<T>(
    address: string,
    abi: Array<string | Fragment | JsonFragment>,
    provider: providers.Provider,
): T {
    return (new Contract(address, abi, provider) as unknown) as T
}

export async function balanceOf(trader: string, erc20: TetherToken): Promise<string> {
    return utils.formatUnits(await erc20.balanceOf(trader), await erc20.decimals())
}
