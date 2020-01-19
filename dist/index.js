"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const io_1 = require("@actions/io");
const exec_1 = require("@actions/exec");
const js_yaml_1 = require("js-yaml");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const MakeTGZ = async (tmpFolder, output) => {
    core_1.info("\n\ntmpFolder : " + tmpFolder + "\noutput : " + output);
    const archtemp = path_1.join(os_1.tmpdir(), "archtemp.tar");
    await exec_1.exec("tar -cf " + archtemp + ' "' + (tmpFolder.endsWith("/") ? tmpFolder : tmpFolder + '/') + '"');
    await exec_1.exec('gzip -f ' + archtemp);
    await io_1.mv(archtemp + ".gz", output);
    await io_1.rmRF(tmpFolder);
};
const CreateOneAssetFolder = (metaFileRelativePathWithExtension, projectRoot, tmpFolder, index, output, processHasDone) => {
    const metaFileAbsolutePath = path_1.join(projectRoot, metaFileRelativePathWithExtension);
    fs_1.readFile(metaFileAbsolutePath, { encoding: "utf-8" }, async (err, data) => {
        if (err) {
            throw err;
        }
        const metaDatum = js_yaml_1.safeLoad(data);
        const guid = metaDatum.guid;
        const dir = path_1.join(tmpFolder, guid);
        await io_1.mkdirP(dir);
        await io_1.cp(metaFileAbsolutePath, path_1.join(dir, "asset.meta"));
        if (metaDatum.folderAsset !== "yes") {
            const assetFileAbsolutePath = metaFileAbsolutePath.substr(0, metaFileAbsolutePath.length - 5);
            await io_1.cp(assetFileAbsolutePath, path_1.join(dir, "asset"));
        }
        const assetFileRelativePath = metaFileRelativePathWithExtension.substr(0, metaFileRelativePathWithExtension.length - 5);
        fs_1.writeFile(path_1.join(dir, "pathname"), assetFileRelativePath, async () => {
            processHasDone[index] = true;
            if (processHasDone.indexOf(false) === -1)
                await MakeTGZ(tmpFolder, output);
        });
    });
};
const ProcessMetaFiles = (metaFiles, projectRoot, tmpFolder, output, processHasDone) => {
    metaFiles.forEach((metaFilePath, index, _) => {
        CreateOneAssetFolder(metaFilePath, projectRoot, tmpFolder, index, output, processHasDone);
    });
};
const IsNotNullOrWhiteSpace = (value) => value && value.trim();
const Split = (linesConcat) => {
    const splits = linesConcat.split(/\r\n|\n|\r/);
    return splits.filter(IsNotNullOrWhiteSpace);
};
const Run = () => {
    var _a;
    const output = core_1.getInput("package-path", { required: true });
    let name = path_1.basename(output);
    name = name.substr(0, name.length - 13);
    const projectFolder = (_a = core_1.getInput("project-folder", { required: false }), (_a !== null && _a !== void 0 ? _a : "./"));
    const includeFilesPath = core_1.getInput("include-files", { required: true });
    fs_1.readFile(includeFilesPath, { encoding: "utf-8" }, async (err, data) => {
        if (err) {
            throw err;
        }
        const tmpFolder = path_1.join(os_1.tmpdir(), name, "archtemp");
        await io_1.mkdirP(tmpFolder);
        core_1.info("include-files\n\n" + data);
        const metaFiles = Split(data);
        const processHasDone = new Array(metaFiles.length);
        processHasDone.fill(false);
        ProcessMetaFiles(metaFiles, projectFolder, tmpFolder, output, processHasDone);
    });
};
Run();
