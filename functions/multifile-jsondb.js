'use strict';

const path = require('path');
const fs = require('fs');

const CHARACTER_MAP = {
    'ç': 'c',
    'Ç': 'C',
    'ğ': 'g',
    'Ğ': 'G',
    'ı': 'i',
    'İ': 'I',
    'ö': 'o',
    'Ö': 'O',
    'ş': 's',
    'Ş': 'S',
    'ü': 'u',
    'Ü': 'U',
    'ß': 'ss',
    'æ': 'ae',
    'Æ': 'AE',
    'œ': 'oe',
    'Œ': 'OE',
    'ø': 'o',
    'Ø': 'O',
    'đ': 'd',
    'Đ': 'D',
    'ł': 'l',
    'Ł': 'L',
    'þ': 'th',
    'Þ': 'Th',
    'ð': 'd',
    'Ð': 'D',
    'α': 'a',
    'ά': 'a',
    'Α': 'A',
    'Β': 'B',
    'β': 'b',
    'γ': 'g',
    'Γ': 'G',
    'δ': 'd',
    'Δ': 'D',
    'ε': 'e',
    'έ': 'e',
    'Ε': 'E',
    'ζ': 'z',
    'Ζ': 'Z',
    'η': 'i',
    'ή': 'i',
    'Η': 'I',
    'θ': 'th',
    'Θ': 'Th',
    'ι': 'i',
    'ί': 'i',
    'ϊ': 'i',
    'ΐ': 'i',
    'Ι': 'I',
    'κ': 'k',
    'Κ': 'K',
    'λ': 'l',
    'Λ': 'L',
    'μ': 'm',
    'Μ': 'M',
    'ν': 'n',
    'Ν': 'N',
    'ξ': 'x',
    'Ξ': 'X',
    'ο': 'o',
    'ό': 'o',
    'Ο': 'O',
    'π': 'p',
    'Π': 'P',
    'ρ': 'r',
    'Ρ': 'R',
    'σ': 's',
    'ς': 's',
    'Σ': 'S',
    'τ': 't',
    'Τ': 'T',
    'υ': 'y',
    'ύ': 'y',
    'ϋ': 'y',
    'ΰ': 'y',
    'Υ': 'Y',
    'φ': 'f',
    'Φ': 'F',
    'χ': 'ch',
    'Χ': 'Ch',
    'ψ': 'ps',
    'Ψ': 'Ps',
    'ω': 'o',
    'ώ': 'o',
    'Ω': 'O',
    'а': 'a',
    'А': 'A',
    'б': 'b',
    'Б': 'B',
    'в': 'v',
    'В': 'V',
    'г': 'g',
    'Г': 'G',
    'д': 'd',
    'Д': 'D',
    'е': 'e',
    'Е': 'E',
    'ё': 'yo',
    'Ё': 'Yo',
    'ж': 'zh',
    'Ж': 'Zh',
    'з': 'z',
    'З': 'Z',
    'и': 'i',
    'И': 'I',
    'й': 'y',
    'Й': 'Y',
    'к': 'k',
    'К': 'K',
    'л': 'l',
    'Л': 'L',
    'м': 'm',
    'М': 'M',
    'н': 'n',
    'Н': 'N',
    'о': 'o',
    'О': 'O',
    'п': 'p',
    'П': 'P',
    'р': 'r',
    'Р': 'R',
    'с': 's',
    'С': 'S',
    'т': 't',
    'Т': 'T',
    'у': 'u',
    'У': 'U',
    'ф': 'f',
    'Ф': 'F',
    'х': 'h',
    'Х': 'H',
    'ц': 'ts',
    'Ц': 'Ts',
    'ч': 'ch',
    'Ч': 'Ch',
    'ш': 'sh',
    'Ш': 'Sh',
    'щ': 'shch',
    'Щ': 'Shch',
    'ы': 'y',
    'Ы': 'Y',
    'э': 'e',
    'Э': 'E',
    'ю': 'yu',
    'Ю': 'Yu',
    'я': 'ya',
    'Я': 'Ya',
    'ь': '',
    'Ь': '',
    'ъ': '',
    'Ъ': ''
};

function transliterateCharacter(character) {
    if (Object.prototype.hasOwnProperty.call(CHARACTER_MAP, character)) return CHARACTER_MAP[character];
    if (/^[\x00-\x7F]$/.test(character)) return character;

    const normalized = character.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (/^[\x00-\x7F]+$/.test(normalized)) return normalized;

    return `u${character.codePointAt(0).toString(16)}`;
}

module.exports.normalizeTableName = function (tableName) {
    if (typeof tableName !== 'string') return tableName;

    const normalizedName = Array.from(tableName)
        .map(transliterateCharacter)
        .join('');

    return normalizedName
        .replace(/[^A-Za-z0-9._-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '') || 'table';
};

module.exports.ensureFolder = function (dbFolder) {
    if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
};

module.exports.getTableFilePath = function (dbFolder, tableName) {
    return path.join(dbFolder, `${tableName}.json`);
};

module.exports.getNormalizedTableFilePath = function (dbFolder, tableName) {
    return module.exports.getTableFilePath(dbFolder, module.exports.normalizeTableName(tableName));
};

module.exports.ensureNormalizedTableFilePath = function (dbFolder, tableName) {
    const exactPath = module.exports.getTableFilePath(dbFolder, tableName);
    const normalizedPath = module.exports.getNormalizedTableFilePath(dbFolder, tableName);

    if (exactPath === normalizedPath) return normalizedPath;
    if (fs.existsSync(normalizedPath)) return normalizedPath;

    if (fs.existsSync(exactPath)) fs.renameSync(exactPath, normalizedPath);
    return normalizedPath;
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
    const filePath = module.exports.ensureNormalizedTableFilePath(dbFolder, tableName);
    const tempPath = path.join(dbFolder, `${path.basename(filePath, '.json')}.tmp`);

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