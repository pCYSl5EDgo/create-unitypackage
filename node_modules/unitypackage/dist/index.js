"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const zlib_1 = require("zlib");
const child_process_1 = require("child_process");
var UnityPackageMaker;
(function (UnityPackageMaker) {
    UnityPackageMaker.loadAssetMetaData = (data) => js_yaml_1.safeLoad(data);
    function NoOperation(err) { if (err)
        throw err; }
    ;
    UnityPackageMaker.createUnityPackageFromFolder = (folderContainsMetaFolders, output, callback, logger) => {
        const archtemp = path_1.join(os_1.tmpdir(), "archtemp.tar");
        child_process_1.execSync('tar -cf ' + archtemp + ' -C "' + folderContainsMetaFolders + '" ./');
        fs_1.readFile(archtemp, (err, data) => {
            if (err)
                throw err;
            zlib_1.gzip(data, (err, data) => {
                if (err)
                    throw err;
                if (logger)
                    logger('write-done : ' + output);
                fs_1.writeFile(output, data, () => fs_1.rmdir(folderContainsMetaFolders, callback || NoOperation));
            });
        });
    };
    UnityPackageMaker.createMetaFolderUnderFolder = (folderContainsMetaFolders, metaFileRelativePathWithExtension, projectRoot, callback, logger) => {
        const metaFileAbsolutePath = path_1.join(projectRoot, metaFileRelativePathWithExtension);
        fs_1.readFile(metaFileAbsolutePath, { encoding: "utf-8" }, async (err, data) => {
            if (err)
                throw err;
            const metaDatum = UnityPackageMaker.loadAssetMetaData(data);
            const guid = metaDatum.guid;
            const dir = path_1.join(folderContainsMetaFolders, guid);
            if (logger)
                logger('create-directory : ' + dir);
            fs_1.mkdir(dir, () => {
                fs_1.copyFile(metaFileAbsolutePath, path_1.join(dir, "asset.meta"), () => {
                    if (metaDatum.folderAsset !== "yes") {
                        const assetFileAbsolutePath = metaFileAbsolutePath.substr(0, metaFileAbsolutePath.length - 5);
                        fs_1.copyFileSync(assetFileAbsolutePath, path_1.join(dir, "asset"));
                    }
                    const assetFileRelativePath = metaFileRelativePathWithExtension.substr(0, metaFileRelativePathWithExtension.length - 5);
                    fs_1.writeFile(path_1.join(dir, "pathname"), assetFileRelativePath, callback || NoOperation);
                });
            });
        });
    };
    UnityPackageMaker.createUnityPackageFromMetaFilePathsWithTempFolder = (metaFiles, projectRoot, output, folderContainsMetaFolders, logger) => {
        const processHasDone = new Array(metaFiles.length);
        processHasDone.fill(false);
        metaFiles.forEach((metaFilePath, index, _) => {
            const callback = () => {
                processHasDone[index] = true;
                if (processHasDone.indexOf(false) === -1)
                    UnityPackageMaker.createUnityPackageFromFolder(folderContainsMetaFolders, output);
            };
            UnityPackageMaker.createMetaFolderUnderFolder(metaFilePath, projectRoot, folderContainsMetaFolders, callback, logger);
        });
    };
})(UnityPackageMaker = exports.UnityPackageMaker || (exports.UnityPackageMaker = {}));
exports.createUnityPackage = (metaFiles, projectRoot, output, logger) => {
    fs_1.mkdtemp("tempFolder", (err, folder) => {
        if (err)
            throw err;
        const folderContainsMetaFolders = path_1.join(folder, 'archtemp');
        fs_1.mkdir(folderContainsMetaFolders, () => {
            UnityPackageMaker.createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles, projectRoot, output, folderContainsMetaFolders, logger);
        });
    });
};
