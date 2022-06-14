import type { Format } from "esbuild";
interface BuildOptions {
    pattern: string;
    tsConfig: string;
    bundle: boolean;
    format?: Format;
    compileTarget: string;
    rootDir: string;
    outDir: string;
    watchDir?: string;
}
export declare function handleBuildReactCommand(watch: boolean, options: BuildOptions): Promise<void>;
export declare function handleBuildTypeScriptCommand(watch: boolean, options: BuildOptions): Promise<void>;
export declare function handleBuildAllCommand(watch: boolean, reactOptions: BuildOptions, typescriptOptions: BuildOptions): Promise<void>;
export {};
