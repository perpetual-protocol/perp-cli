export enum StageName {
    Production = "production",
    Staging = "staging",
}

export class Stage {
    readonly name: StageName

    constructor(stageName: unknown) {
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

export function getStageName(strStage: unknown): StageName {
    return new Stage(strStage).name
}
