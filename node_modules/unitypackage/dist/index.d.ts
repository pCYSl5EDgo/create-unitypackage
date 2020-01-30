/// <reference types="node" />
import { NoParamCallback } from 'fs';
export interface AssetMetaData {
    guid: string;
    folderAsset: 'yes' | 'no' | undefined;
}
export declare const loadAssetMetaData: (data: string) => AssetMetaData;
export declare const createUnityPackageFromFolder: (folderContainsMetaFolders: string, output: string, callback?: NoParamCallback | undefined) => void;
export declare const createMetaFolderUnderFolder: (folderContainsMetaFolders: string, metaFileRelativePathWithExtension: string, projectRoot: string, callback?: NoParamCallback | undefined) => void;
export declare const createUnityPackageFromMetaFilePaths: (metaFiles: string[], projectRoot: string, output: string) => void;
