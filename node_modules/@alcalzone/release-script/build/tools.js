"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoChangelog = exports.splitChangelog = exports.cleanChangelogForNews = exports.limitKeys = exports.prependKey = exports.extractCurrentChangelog = void 0;
const objects_1 = require("alcalzone-shared/objects");
/** Extracts the current (work in progress) changelog from the complete changelog text */
function extractCurrentChangelog(changelogText, versionHeaderPrefix, nextVersionPlaceholderRegex) {
    const match = nextVersionPlaceholderRegex.exec(changelogText);
    if (!match)
        return;
    const start = match.index + match[0].length;
    let entry = changelogText.slice(start);
    const nextHeadlineRegex = new RegExp(`^${versionHeaderPrefix} `, "gm");
    const matchEnd = nextHeadlineRegex.exec(entry);
    if (matchEnd) {
        entry = entry.slice(0, matchEnd.index);
    }
    return entry.trim();
}
exports.extractCurrentChangelog = extractCurrentChangelog;
function prependKey(obj, newKey, value) {
    const ret = { [newKey]: value };
    for (const [k, v] of objects_1.entries(obj)) {
        ret[k] = v;
    }
    return ret;
}
exports.prependKey = prependKey;
function limitKeys(obj, count) {
    const ret = {};
    for (const [k, v] of objects_1.entries(obj).slice(0, count)) {
        ret[k] = v;
    }
    return ret;
}
exports.limitKeys = limitKeys;
const changelogAuthorRegex = /^[ \t]*[\*\-][ \t]*\([a-z0-9\-_,;&\+ ]+\)[ \t]*/gim;
const changelogBulletPointTestRegex = /^[ \t]*[\*\-][ \t]*/;
const changelogBulletPointReplaceRegex = new RegExp(changelogBulletPointTestRegex, "mg");
function cleanChangelogForNews(changelog) {
    // Remove leading "* (Author) " from changelog entries
    changelog = changelog
        .trim()
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(changelogAuthorRegex, "* ");
    // If all changelog entries are either empty or start with a bullet point, remove that too
    const lines = changelog.split("\n");
    if (lines.every((line) => !line || changelogBulletPointTestRegex.test(line))) {
        changelog = changelog.replace(changelogBulletPointReplaceRegex, "");
    }
    return changelog;
}
exports.cleanChangelogForNews = cleanChangelogForNews;
/** Splits a complete changelog into the most recent 5 entries plus the rest */
function splitChangelog(changelog, entryPrefix, numEntriesNew = 5) {
    const changelogEntryRegex = new RegExp(
    // match changelog headline with optional free text at the end
    `^${entryPrefix} v?\\d+\\.\\d+\\.\\d+(.+?\\(\\d{4}\\-\\d{2}\\-\\d{2}\\))?.*?$`, "gm");
    let matchStart;
    let firstStartIndex;
    let lastEndIndex;
    const entries = [];
    while ((matchStart = changelogEntryRegex.exec(changelog))) {
        let entry = changelog.slice(matchStart.index);
        const nextHeadlineRegex = new RegExp(`^${entryPrefix.slice(1)}`, "gm");
        const matchEnd = nextHeadlineRegex.exec(entry.slice(matchStart[0].length));
        if (matchEnd) {
            entry = entry.slice(0, matchStart[0].length + matchEnd.index);
        }
        entries.push(entry);
        // Remember where the changelog starts and ends
        if (!firstStartIndex)
            firstStartIndex = matchStart.index;
        lastEndIndex = matchStart.index + entry.length;
    }
    if (!firstStartIndex) {
        // no entries found
        return {
            newChangelog: changelog,
        };
    }
    // Keep the first <numEntriesNew> entries in the new changelog,
    // put all others in the old changelog
    return {
        newChangelog: changelog.slice(0, firstStartIndex) +
            entries.slice(0, numEntriesNew).join("") +
            changelog.slice(lastEndIndex),
        oldChangelog: entries.length > numEntriesNew
            ? entries
                .slice(numEntriesNew)
                .map((e) => e.slice(1))
                .join("")
            : undefined,
    };
}
exports.splitChangelog = splitChangelog;
/** Inserts new entries at the start of a changelog */
function insertIntoChangelog(changelog, newEntries, entryPrefix) {
    const firstEntryIndex = changelog.indexOf(entryPrefix);
    if (firstEntryIndex === -1) {
        if (!changelog.endsWith("\n"))
            changelog += "\n";
        return changelog + newEntries;
    }
    return (changelog.slice(0, firstEntryIndex) +
        newEntries +
        changelog.slice(firstEntryIndex));
}
exports.insertIntoChangelog = insertIntoChangelog;
