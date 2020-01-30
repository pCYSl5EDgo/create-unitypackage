import { getInput, info } from '@actions/core';
import { mkdirP, cp, rmRF, mv } from '@actions/io';
import { exec } from '@actions/exec';
import { execSync } from 'child_process';
import { safeLoad } from 'js-yaml';
import { readFile, writeFile } from 'fs';
import { join, basename } from 'path';
import { tmpdir } from 'os';

interface AssetMetaData {
    guid: string;
    folderAsset: 'yes' | 'no' | undefined
}

const MakeTGZ = async (tmpFolder: string, output: string) => {
    info("\n\ntmpFolder : " + tmpFolder + "\noutput : " + output);
    const archtemp = join(tmpdir(), "archtemp.tar");
    execSync('cd ' + tmpFolder + "\ntar -cf ../../archtemp.tar ./");
    await exec('gzip -f ' + archtemp);
    await mv(archtemp + ".gz", output);
    await rmRF(tmpFolder);
};

const CreateOneAssetFolder = (metaFileRelativePathWithExtension: string, projectRoot: string, tmpFolder: string, index: number, output: string, processHasDone: boolean[]) => {
    const metaFileAbsolutePath = join(projectRoot, metaFileRelativePathWithExtension);
    readFile(metaFileAbsolutePath, { encoding: "utf-8" }, async (err, data) => {
        if (err) {
            throw err;
        }
        const metaDatum: AssetMetaData = safeLoad(data);
        const guid = metaDatum.guid;
        const dir = join(tmpFolder, guid);

        await mkdirP(dir);

        await cp(metaFileAbsolutePath, join(dir, "asset.meta"));

        if (metaDatum.folderAsset !== "yes") {
            const assetFileAbsolutePath = metaFileAbsolutePath.substr(0, metaFileAbsolutePath.length - 5);
            await cp(assetFileAbsolutePath, join(dir, "asset"));
        }

        const assetFileRelativePath = metaFileRelativePathWithExtension.substr(0, metaFileRelativePathWithExtension.length - 5);
        writeFile(join(dir, "pathname"), assetFileRelativePath, async () => {
            processHasDone[index] = true;
            if (processHasDone.indexOf(false) === -1)
                await MakeTGZ(tmpFolder, output);
        });
    });
};

const ProcessMetaFiles = (metaFiles: string[], projectRoot: string, tmpFolder: string, output: string, processHasDone: boolean[]) => {
    metaFiles.forEach((metaFilePath, index, _) => {
        CreateOneAssetFolder(metaFilePath, projectRoot, tmpFolder, index, output, processHasDone);
    });
};

const IsNotNullOrWhiteSpace = (value: string) => value && value.trim();

const Split = (linesConcat: string) => {
    const splits = linesConcat.split(/\r\n|\n|\r/);
    return splits.filter(IsNotNullOrWhiteSpace);
};

const Run = () => {
    const output = getInput("package-path", { required: true });
    let name = basename(output);
    name = name.substr(0, name.length - 13);
    const projectFolder = getInput("project-folder", { required: false }) ?? "./";

    const includeFilesPath = getInput("include-files", { required: true });
    readFile(includeFilesPath, { encoding: "utf-8" }, async (err, data) => {
        if (err) {
            throw err;
        }
        const tmpFolder = join(tmpdir(), name, "archtemp");
        await mkdirP(tmpFolder);
        info("include-files\n\n" + data);
        const metaFiles = Split(data);
        const processHasDone = new Array(metaFiles.length);
        processHasDone.fill(false);
        ProcessMetaFiles(metaFiles, projectFolder, tmpFolder, output, processHasDone);
    });
};

Run();