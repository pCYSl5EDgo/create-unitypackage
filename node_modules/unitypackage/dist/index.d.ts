/// <reference types="node" />
import { NoParamCallback } from 'fs';
export interface AssetMetaData {
    guid: string;
    folderAsset: 'yes' | 'no' | undefined;
}
export declare module InternalImplementation {
    const loadAssetMetaData: (data: string) => AssetMetaData;
    function createUnityPackageFromFolder(folderContainsMetaFolders: string, output: string, callback?: NoParamCallback, logger?: (logText: string) => void, removeDirs?: string[]): void;
    function createMetaFolderUnderFolder(metaFileRelativePathWithExtension: string, projectRoot: string, folderContainsMetaFolders: string, callback?: NoParamCallback, logger?: (logText: string) => void): void;
    function createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles: string[], projectRoot: string, output: string, folderContainsMetaFolders: string, logger?: (logText: string) => void, removeDirs?: string[]): void;
}
export default function createUnityPackage(metaFiles: string[], projectRoot: string, output: string, logger?: (logText: string) => void): void;
