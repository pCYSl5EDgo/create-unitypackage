"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const fs_1 = require("fs");
const unitypackage_1 = require("unitypackage");
const IsNotNullOrWhiteSpace = (value) => value && value.trim();
const Split = (linesConcat) => {
    const splits = linesConcat.split(/\r\n|\n|\r/);
    return splits.filter(IsNotNullOrWhiteSpace);
};
const Run = () => {
    var _a;
    const output = core_1.getInput("package-path", { required: true });
    const projectFolder = (_a = core_1.getInput("project-folder", { required: false }), (_a !== null && _a !== void 0 ? _a : "./"));
    const includeFilesPath = core_1.getInput("include-files", { required: true });
    fs_1.readFile(includeFilesPath, { encoding: "utf-8" }, async (err, data) => {
        if (err)
            throw err;
        const metaFiles = Split(data);
        unitypackage_1.createUnityPackageFromMetaFilePaths(metaFiles, projectFolder, output);
    });
};
Run();
