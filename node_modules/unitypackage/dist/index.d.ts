/// <reference types="node" resolution-mode="require"/>
export declare type NoParamAsyncCallback = (err: NodeJS.ErrnoException | null) => Promise<void>;
export interface AssetMetaData {
    guid: string;
    folderAsset: 'yes' | 'no' | undefined;
}
export declare module InternalImplementation {
    const loadAssetMetaData: (data: string) => AssetMetaData;
    function createUnityPackageFromFolder(folderContainsMetaFolders: string, output: string, callback?: NoParamAsyncCallback, logger?: (logText: string) => void, removeDirs?: string[]): Promise<void>;
    function createMetaFolderUnderFolder(metaFileRelativePathWithExtension: string, projectRoot: string, folderContainsMetaFolders: string, callback?: NoParamAsyncCallback, logger?: (logText: string) => void): Promise<void>;
    function createUnityPackageFromMetaFilePathsWithTempFolder(metaFiles: string[], projectRoot: string, output: string, folderContainsMetaFolders: string, logger?: (logText: string) => void, removeDirs?: string[]): Promise<void>;
}
export default function createUnityPackage(metaFiles: string[], projectRoot: string, output: string, logger?: (logText: string) => void): Promise<void>;
