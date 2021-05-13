import { Fragment, JsonFragment } from "@ethersproject/abi"
import { Provider } from "@ethersproject/providers"
import { Contract, utils } from "ethers"
import { TetherToken } from "../type"
import { Signer } from "@ethersproject/abstract-signer"

export function getContract<T>(
    address: string,
    abi: Array<string | Fragment | JsonFragment>,
    provider: Provider | Signer,
): T {
    return (new Contract(address, abi, provider) as unknown) as T
}

export async function balanceOf(trader: string, erc20: TetherToken): Promise<string> {
    return utils.formatUnits(await erc20.balanceOf(trader), await erc20.decimals())
}
