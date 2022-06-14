export declare function escapeRegExp(value: string): string;
export declare function padRight(text: string, totalLength: number): string;
export declare function error(message: string): void;
export declare function die(message: string): never;
export declare function interceptErrors(func: () => Promise<void>): () => Promise<void>;
