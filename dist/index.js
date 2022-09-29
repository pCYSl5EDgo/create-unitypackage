import { getInput, info } from '@actions/core';
import create from 'unitypackage';
import { readFile } from 'node:fs/promises';
const IsNotNullOrWhiteSpace = (value) => value && value.trim();
const Split = (linesConcat) => {
    const splits = linesConcat.split(/\r\n|\n|\r/);
    return splits.filter(IsNotNullOrWhiteSpace);
};
const Run = async () => {
    const output = getInput("package-path", { required: true });
    const projectFolder = getInput("project-folder", { required: false }) ?? "./";
    const includeFilesPath = getInput("include-files", { required: true });
    const data = await readFile(includeFilesPath, { encoding: "utf-8" });
    const metaFiles = Split(data);
    await create(metaFiles, projectFolder, output, info);
};
await Run();
