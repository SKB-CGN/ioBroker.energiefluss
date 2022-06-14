"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bump = exports.getChangedWorkspaces = exports.isYarnWorkspace = void 0;
const typeguards_1 = require("alcalzone-shared/typeguards");
const execa_1 = __importDefault(require("execa"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
/**
 * Tests if the current workspace is using yarn with the version and workspace-tools plugin,
 * which can be used to bump the versions
 */
async function isYarnWorkspace() {
    // There should be a yarn.lock or yarn is not used
    if (!(await fs_extra_1.default.pathExists(path_1.default.join(process.cwd(), "yarn.lock")))) {
        return false;
    }
    // package.json should contain a workspaces field
    const packageJson = await fs_extra_1.default.readJSON(path_1.default.join(process.cwd(), "package.json"), { encoding: "utf8" });
    if (!("workspaces" in packageJson && typeguards_1.isArray(packageJson.workspaces))) {
        return false;
    }
    // Check if yarn is used in at least version 2
    const { stdout: yarnVersion } = await execa_1.default("yarn", ["-v"], {
        reject: false,
    });
    if (!semver_1.default.valid(yarnVersion) || semver_1.default.lt(yarnVersion, "2.0.0")) {
        return false;
    }
    // Check that the version plugin is there
    const { stdout: plugins } = await execa_1.default("yarn", ["plugin", "runtime", "--json"], {
        reject: false,
    });
    return (plugins.includes(`"@yarnpkg/plugin-version"`) &&
        plugins.includes(`"@yarnpkg/plugin-workspace-tools"`));
}
exports.isYarnWorkspace = isYarnWorkspace;
async function getChangedWorkspaces() {
    const { stdout: checkResult } = await execa_1.default("yarn", ["version", "check"], {
        reject: false,
    });
    const matches = [
        ...checkResult.matchAll(/ (?<workspace>@?[^ ]*?)@.+ has been modified but/g),
    ].map((match) => match.groups.workspace);
    return matches;
}
exports.getChangedWorkspaces = getChangedWorkspaces;
async function bump(workspace, type) {
    await execa_1.default("yarn", ["workspace", workspace, "version", type]);
}
exports.bump = bump;
