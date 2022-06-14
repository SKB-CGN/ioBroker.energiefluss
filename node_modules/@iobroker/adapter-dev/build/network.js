"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestTimeout = exports.applyHttpsProxy = void 0;
const url_1 = require("url");
/**
 * Adds https proxy options to an axios request if they were defined as an env variable
 * @param options The options object passed to axios
 */
function applyHttpsProxy(options) {
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    if (proxy) {
        try {
            const proxyUrl = new url_1.URL(proxy);
            if (proxyUrl.hostname) {
                options.proxy = {
                    host: proxyUrl.hostname,
                    port: proxyUrl.port ? parseInt(proxyUrl.port, 10) : 443,
                };
            }
        }
        catch {
            // Invalid URL, don't use proxy
        }
    }
    return options;
}
exports.applyHttpsProxy = applyHttpsProxy;
function getRequestTimeout() {
    let ret;
    if (process.env.REQUEST_TIMEOUT) {
        ret = parseInt(process.env.REQUEST_TIMEOUT, 10);
    }
    if (ret == undefined || Number.isNaN(ret))
        return 5000;
    return ret;
}
exports.getRequestTimeout = getRequestTimeout;
//# sourceMappingURL=network.js.map