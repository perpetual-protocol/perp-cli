import fetch from "node-fetch"
import { StageName } from "./stage"

export interface ContractMetadata {
    name: string
    address: string
}

export interface Contracts {
    [key: string]: ContractMetadata
}

export interface ExternalContracts {
    [key: string]: string
}

export interface Layer {
    contracts: Contracts
    accounts: any[]
    network: string
    externalContracts: ExternalContracts
}

export interface Layers {
    layer1: Layer
    layer2: Layer
}

export interface Metadata {
    layers: Layers
}

export function fetchMetadata(stageName: StageName): Promise<Metadata> {
    return fetch(`https://metadata.perp.exchange/${stageName}.json`).then(res => res.json()) as Promise<Metadata>
}
