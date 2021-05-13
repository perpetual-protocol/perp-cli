import { DateTime } from "luxon"
import { NetworkName } from "./provider"

export function getEstimatedBlockTimestamp(
    networkName: NetworkName,
    currentBlock: number,
    currentTimestamp: number,
    targetBlock: number,
): number {
    let blockDuration = 0
    if (networkName === NetworkName.Homestead) {
        blockDuration = 15
    } else if (networkName === NetworkName.Xdai) {
        blockDuration = 5
    } else {
        throw new Error("unsupported network name")
    }

    const offset = (currentBlock - targetBlock) * blockDuration
    return currentTimestamp - offset
}

export function timestamp2DateStr(timestamp: number): string {
    return DateTime.fromSeconds(timestamp).toFormat("yyyy/M/d T")
}
