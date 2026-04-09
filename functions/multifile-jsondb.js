'use strict';

const path = require('path');
const fs = require('fs');

module.exports.ensureFolder = function (dbFolder) {
    if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
};

module.exports.getTableFilePath = function (dbFolder, tableName) {
    return path.join(dbFolder, `${tableName}.json`);
};

module.exports.listTableFiles = function (dbFolder) {
    if (!fs.existsSync(dbFolder)) return [];

    const files = fs.readdirSync(dbFolder);
    const tables = [];

    for (const file of files) {
        if (file.endsWith('.json') && !file.endsWith('.backup.json') && !file.endsWith('.tmp')) tables.push(file.replace('.json', ''));
    }

    return tables;
};

module.exports.atomicWrite = function (dbFolder, tableName, data, readable) {
    const filePath = module.exports.getTableFilePath(dbFolder, tableName);
    const tempPath = path.join(dbFolder, `${tableName}.tmp`);

    const content = readable ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    fs.writeFileSync(tempPath, content, 'utf8');
    fs.renameSync(tempPath, filePath);
};

module.exports.set = function (keyPath, value, obj, separator) {
    const parts = keyPath.split(separator);
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (typeof current[key] !== 'object' || current[key] === null) current[key] = {};

        current = current[key];
    }

    current[parts[parts.length - 1]] = value;
};

module.exports.get = function (obj, separator, ...keys) {
    return keys.reduce(function (acc, key) {
        if (acc === undefined || acc === null) return undefined;

        return acc[key];
    }, obj);
};

module.exports.remove = function (obj, keyPath, separator) {
    if (!obj || !keyPath) return;

    const parts = typeof keyPath === 'string' ? keyPath.split(separator) : keyPath;
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];

        if (typeof current === 'undefined') return;
    }

    delete current[parts[parts.length - 1]];
};

module.exports.removeEmptyData = function (obj) {
    const remove = function (obj) {
        Object.keys(obj).forEach(function (key) {
            if (obj[key] && typeof obj[key] === 'object') remove(obj[key]);
            else if (obj[key] === null || obj[key] === '') delete obj[key];

            if (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) delete obj[key];
        });
    };

    Object.keys(obj).forEach(function (key) {
        if (obj[key] && typeof obj[key] === 'object') remove(obj[key]);
        else if (obj[key] === null || obj[key] === '') delete obj[key];

        if (typeof obj[key] === 'object' && obj[key] !== null && Object.keys(obj[key]).length === 0) delete obj[key];
    });

    return obj;
};