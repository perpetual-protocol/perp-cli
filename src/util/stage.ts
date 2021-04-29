export enum StageName {
    Production = "production",
    Staging = "staging",
}

export class Stage {
    readonly name: StageName

    constructor(stageName?: string) {
        switch (stageName) {
            case StageName.Production:
            case StageName.Staging:
                this.name = stageName
                break

            default:
                this.name = StageName.Production
                break
        }
    }
}

export function getStageName(): StageName {
    return new Stage(process.env.PERP_STAGE).name
}
