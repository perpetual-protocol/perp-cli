"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Stage_1 = require("../src/Stage");
describe("getStage", () => {
    it("gets production as default", () => {
        const stageName = Stage_1.getStage();
        chai_1.expect(stageName).eq(Stage_1.StageName.Production);
    });
});
describe("Stage", () => {
    it("gets production stage as default", () => {
        const stage = new Stage_1.Stage();
        chai_1.expect(stage.name).eq(Stage_1.StageName.Production);
    });
});
