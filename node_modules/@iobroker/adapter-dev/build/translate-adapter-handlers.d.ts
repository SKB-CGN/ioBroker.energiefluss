/// <reference types="iobroker" />
export declare const allLanguages: ioBroker.Languages[];
/******************************** Middlewares *********************************/
export declare function parseOptions(options: {
    "io-package": string;
    admin: string;
    words?: string;
    base?: string[];
    languages?: string[];
}): Promise<void>;
/***************************** Command Handlers *******************************/
export declare function handleTranslateCommand(): Promise<void>;
export declare function handleToJsonCommand(): Promise<void>;
export declare function handleToWordsCommand(): Promise<void>;
export declare function handleAllCommand(): Promise<void>;
