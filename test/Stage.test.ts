import { expect } from "chai"
import { Stage, getStageName, StageName } from "../src/Stage"

describe("getStage", () => {
    it("gets production as default", () => {
        const stageName = getStageName()
        expect(stageName).eq(StageName.Production)
    })
})

describe("Stage", () => {
    it("gets production stage as default", () => {
        const stage = new Stage()
        expect(stage.name).eq(StageName.Production)
    })
})
