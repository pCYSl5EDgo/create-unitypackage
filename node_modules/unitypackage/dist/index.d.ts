/// <reference types="node" />
import { NoParamCallback } from 'fs';
export interface AssetMetaData {
    guid: string;
    folderAsset: 'yes' | 'no' | undefined;
}
export declare module UnityPackageMaker {
    const loadAssetMetaData: (data: string) => AssetMetaData;
    const createUnityPackageFromFolder: (folderContainsMetaFolders: string, output: string, callback?: NoParamCallback | undefined, logger?: ((logText: string) => void) | undefined) => void;
    const createMetaFolderUnderFolder: (folderContainsMetaFolders: string, metaFileRelativePathWithExtension: string, projectRoot: string, callback?: NoParamCallback | undefined, logger?: ((logText: string) => void) | undefined) => void;
    const createUnityPackageFromMetaFilePathsWithTempFolder: (metaFiles: string[], projectRoot: string, output: string, folderContainsMetaFolders: string, logger?: ((logText: string) => void) | undefined) => void;
}
export declare const createUnityPackage: (metaFiles: string[], projectRoot: string, output: string, logger?: ((logText: string) => void) | undefined) => void;
