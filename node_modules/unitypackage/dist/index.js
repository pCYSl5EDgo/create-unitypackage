"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const child_process_1 = require("child_process");
var InternalImplementation;
(function (InternalImplementation) {
    InternalImplementation.loadAssetMetaData = (data) => js_yaml_1.safeLoad(data);
    function NoOperation(err) { if (err)
        throw err; }
    ;
    const recursiveDelete = { recursive: true };
    function createUnityPackageFromFolder(folderContainsMetaFolders, output, callback, logger, removeDirs) {
        const tmpDirectory = path_1.join(os_1.tmpdir(), "tmp");
        const archtemp = path_1.join(tmpDirectory, "archtemp.tar");
        fs_1.rmdirSync(tmpDirectory, recursiveDelete);
        fs_1.mkdirSync(tmpDirectory);
        function totalEnd() {
            const archtemp_gzip = archtemp + '.gz';
            fs_1.copyFile(archtemp_gzip, output, (err) => {
                if (err) {
                    throw err;
                }
                if (removeDirs) {
                    for (const removeDir of removeDirs) {
                        fs_1.rmdirSync(removeDir, recursiveDelete);
                    }
                }
                fs_1.rmdirSync(tmpDirectory, recursiveDelete);
                if (callback)
                    callback(null);
            });
        }
        ;
        child_process_1.exec('tar -cf "' + archtemp + '" -C "' + folderContainsMetaFolders + '" .', (err, stdout, stderr) => {
            if (err) {
                if (logger) {
                    logger('stdout : ' + stdout);
                    logger('stderr : ' + stderr);
                }
                throw err;
            }
            const sevenZipPath = '"C:\\Program Files\\7-Zip\\7z.exe"';
            fs_1.exists(sevenZipPath, (doesExist) => {
                if (doesExist) {
                    child_process_1.exec(sevenZipPath + ' a -tgzip "' + archtemp + '.gz" "' + archtemp + '"', totalEnd);
                }
                else {
                    child_process_1.exec('gzip -f "' + archtemp + '"', totalEnd);
                }
            });
        });
    }
    InternalImplementation.createUnityPackageFromFolder = createUnityPackageFromFolder;
    ;
    function createMetaFolderUnderFolder(metaFileRelativePathWithExtension, projectRoot, folderContainsMetaFolders, callback, logger) {
        const metaFileAbsolutePath = path_1.join(projectRoot, metaFileRelativePathWithExtension);
        fs_1.readFile(metaFileAbsolutePath, { encoding: "utf-8" }, async (err, data) => {
            if (err)
                throw err;
            const metaDatum = InternalImplementation.loadAssetMetaData(data);
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
    }
    InternalImplementation.createMetaFolderUnderFolder = createMetaFolderUnderFolder;
    ;
    function createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles, projectRoot, output, folderContainsMetaFolders, logger, removeDirs) {
        const processHasDone = new Array(metaFiles.length);
        processHasDone.fill(false);
        metaFiles.forEach((metaFilePath, index, _) => {
            const callback = () => {
                processHasDone[index] = true;
                if (processHasDone.indexOf(false) === -1)
                    createUnityPackageFromFolder(folderContainsMetaFolders, output, NoOperation, logger, removeDirs);
            };
            createMetaFolderUnderFolder(metaFilePath, projectRoot, folderContainsMetaFolders, callback, logger);
        });
    }
    InternalImplementation.createUnityPackageFromMetaFilePathsWithTempFolder = createUnityPackageFromMetaFilePathsWithTempFolder;
    ;
})(InternalImplementation = exports.InternalImplementation || (exports.InternalImplementation = {}));
function createUnityPackage(metaFiles, projectRoot, output, logger) {
    fs_1.mkdtemp("tempFolder", (err, folder) => {
        if (err) {
            if (logger)
                logger('failedName : ' + folder || '`empty`');
            throw err;
        }
        const folderContainsMetaFolders = path_1.join(folder, 'archtemp');
        fs_1.mkdir(folderContainsMetaFolders, () => {
            const create = InternalImplementation.createUnityPackageFromMetaFilePathsWithTempFolder;
            create(metaFiles, projectRoot, output, folderContainsMetaFolders, logger, [folder]);
        });
    });
}
exports.default = createUnityPackage;
;
//# sourceMappingURL=index.js.map