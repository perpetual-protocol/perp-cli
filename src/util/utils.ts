import { formatError } from "./format"

export function throwError(msg: string) {
    console.log(formatError(msg))
    throw new Error(msg)
}
