import { getInput, info } from '@actions/core';
import { readFile } from 'fs';
import { createUnityPackage } from 'unitypackage';

const IsNotNullOrWhiteSpace = (value: string) => value && value.trim();

const Split = (linesConcat: string) => {
    const splits = linesConcat.split(/\r\n|\n|\r/);
    return splits.filter(IsNotNullOrWhiteSpace);
};

const Run = () => {
    const output = getInput("package-path", { required: true });
    const projectFolder = getInput("project-folder", { required: false }) ?? "./";
    const includeFilesPath = getInput("include-files", { required: true });
    readFile(includeFilesPath, { encoding: "utf-8" }, async (err, data) => {
        if (err) throw err;
        const metaFiles = Split(data);
        createUnityPackage(metaFiles, projectFolder, output, info);
    });
};

Run();