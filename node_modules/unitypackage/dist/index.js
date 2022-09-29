import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { load } from 'js-yaml';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export var InternalImplementation;
(function (InternalImplementation) {
    InternalImplementation.loadAssetMetaData = (data) => load(data);
    async function NoOperation(err) { if (err) {
        throw err;
    } }
    ;
    const recursiveDelete = { recursive: true, force: true };
    async function createUnityPackageFromFolder(folderContainsMetaFolders, output, callback, logger, removeDirs) {
        const tmpDirectory = join(tmpdir(), "tmp");
        const archtemp = join(tmpDirectory, "archtemp.tar");
        await rm(tmpDirectory, recursiveDelete);
        await mkdir(tmpDirectory);
        async function totalEnd() {
            const archtemp_gzip = archtemp + '.gz';
            await copyFile(archtemp_gzip, output);
            if (removeDirs) {
                for (const removeDir of removeDirs) {
                    await rm(removeDir, recursiveDelete);
                }
            }
            try {
                await rm(tmpDirectory, recursiveDelete);
            }
            catch (error) {
                if (callback) {
                    callback(error);
                }
                return;
            }
            if (callback) {
                callback(null);
            }
        }
        ;
        exec('tar -cf "' + archtemp + '" -C "' + folderContainsMetaFolders + '" .', (err, stdout, stderr) => {
            if (err) {
                if (logger) {
                    logger('stdout : ' + stdout);
                    logger('stderr : ' + stderr);
                }
                throw err;
            }
            const sevenZipPath = '"C:\\Program Files\\7-Zip\\7z.exe"';
            if (existsSync(sevenZipPath)) {
                exec(sevenZipPath + ' a -tgzip "' + archtemp + '.gz" "' + archtemp + '"', totalEnd);
            }
            else {
                exec('gzip -f "' + archtemp + '"', totalEnd);
            }
        });
    }
    InternalImplementation.createUnityPackageFromFolder = createUnityPackageFromFolder;
    ;
    async function createMetaFolderUnderFolder(metaFileRelativePathWithExtension, projectRoot, folderContainsMetaFolders, callback, logger) {
        const metaFileAbsolutePath = join(projectRoot, metaFileRelativePathWithExtension);
        const data = await readFile(metaFileAbsolutePath, { encoding: "utf-8" });
        const metaDatum = InternalImplementation.loadAssetMetaData(data);
        const guid = metaDatum.guid;
        const dir = join(folderContainsMetaFolders, guid);
        if (logger) {
            logger('create-directory : ' + dir);
        }
        await mkdir(dir);
        await copyFile(metaFileAbsolutePath, join(dir, "asset.meta"));
        if (metaDatum.folderAsset !== "yes") {
            const assetFileAbsolutePath = metaFileAbsolutePath.slice(0, metaFileAbsolutePath.length - 5);
            const stats = await stat(assetFileAbsolutePath);
            if (stats.isFile()) {
                await copyFile(assetFileAbsolutePath, join(dir, "asset"));
            }
        }
        const assetFileRelativePath = metaFileRelativePathWithExtension.slice(0, metaFileRelativePathWithExtension.length - 5);
        try {
            await writeFile(join(dir, "pathname"), assetFileRelativePath);
        }
        catch (error) {
            if (callback) {
                callback(error);
            }
            return;
        }
        if (callback) {
            callback(null);
        }
    }
    InternalImplementation.createMetaFolderUnderFolder = createMetaFolderUnderFolder;
    ;
    async function createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles, projectRoot, output, folderContainsMetaFolders, logger, removeDirs) {
        const processHasDone = new Array(metaFiles.length);
        processHasDone.fill(false);
        for (let index = 0; index < metaFiles.length; index++) {
            const currentIndex = index;
            const metaFilePath = metaFiles[currentIndex];
            const callback = async (err) => {
                if (err) {
                    throw err;
                }
                processHasDone[currentIndex] = true;
                if (processHasDone.indexOf(false) === -1) {
                    await createUnityPackageFromFolder(folderContainsMetaFolders, output, NoOperation, logger, removeDirs);
                }
            };
            await createMetaFolderUnderFolder(metaFilePath, projectRoot, folderContainsMetaFolders, callback, logger);
        }
    }
    InternalImplementation.createUnityPackageFromMetaFilePathsWithTempFolder = createUnityPackageFromMetaFilePathsWithTempFolder;
    ;
})(InternalImplementation = InternalImplementation || (InternalImplementation = {}));
export default async function createUnityPackage(metaFiles, projectRoot, output, logger) {
    const folder = await mkdtemp("tempFolder");
    const folderContainsMetaFolders = join(folder, 'archtemp');
    await mkdir(folderContainsMetaFolders);
    await InternalImplementation.createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles, projectRoot, output, folderContainsMetaFolders, logger, [folder]);
}
;
//# sourceMappingURL=index.js.map