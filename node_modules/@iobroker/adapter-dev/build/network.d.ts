import type { AxiosRequestConfig } from "axios";
/**
 * Adds https proxy options to an axios request if they were defined as an env variable
 * @param options The options object passed to axios
 */
export declare function applyHttpsProxy(options: AxiosRequestConfig): AxiosRequestConfig;
export declare function getRequestTimeout(): number;
