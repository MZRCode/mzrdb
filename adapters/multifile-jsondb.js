'use strict';

const functions = require('../functions/multifile-jsondb.js');
const path = require('path');
const fs = require('fs');

class MultiFileJsonDB {
    constructor(options) {
        this.dbName = options['dbName'] || 'mzrdb';
        this.dbFolder = `./${options['dbFolder'] || 'mzrdb'}`;
        this.noBlankData = options['noBlankData'] || false;
        this.readable = options['readable'] || false;
        this.seperator = options['seperator'] || '.';
        this.message = options['message'];
        this.defaultTable = this.dbName;

        this.tableCache = new Map();
        this.writeQueue = new Map();
        this.writeDelay = 100;

        functions.ensureFolder(this.dbFolder);
        this.ensureRootTableFile();
    }

    ensureRootTableFile() {
        const rootFilePath = path.join(this.dbFolder, `${this.dbName}.json`);

        if (fs.existsSync(rootFilePath)) return;

        const content = this.readable ? JSON.stringify({}, null, 2) : JSON.stringify({});
        fs.writeFileSync(rootFilePath, content, 'utf8');
    }

    isEmptyObjectFile(filePath) {
        if (!fs.existsSync(filePath)) return false;

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            return content && typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length === 0;
        } catch {
            return false;
        }
    }

    getTableName(key) {
        if (!key || typeof key !== 'string') return this.defaultTable;

        const parts = key.split(this.seperator);
        if (parts.length === 1) return this.defaultTable;

        return parts[0];
    }

    getTableKey(key) {
        if (!key || typeof key !== 'string') return key;

        const parts = key.split(this.seperator);
        if (parts.length === 1) return key;

        return parts.slice(1).join(this.seperator);
    }

    loadTable(tableName) {
        if (this.tableCache.has(tableName) && this.tableCache.get(tableName).loaded) return this.tableCache.get(tableName).data;

        const filePath = functions.getTableFilePath(this.dbFolder, tableName);
        let data = {};

        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');

                data = JSON.parse(content);
            } catch (err) {
                data = {};
            }
        }

        this.tableCache.set(tableName, { data, dirty: false, loaded: true });
        return data;
    }

    getTableData(tableName) {
        return this.loadTable(tableName);
    }

    markDirty(tableName) {
        if (!this.tableCache.has(tableName)) return;

        const cache = this.tableCache.get(tableName);
        cache.dirty = true;

        if (this.writeQueue.has(tableName)) clearTimeout(this.writeQueue.get(tableName));

        const timeoutId = setTimeout(() => {
            this.flushTable(tableName);
        }, this.writeDelay);

        this.writeQueue.set(tableName, timeoutId);
    }

    flushTable(tableName) {
        if (!this.tableCache.has(tableName)) return;

        const cache = this.tableCache.get(tableName);
        if (!cache.dirty) return;

        if (this.writeQueue.has(tableName)) {
            clearTimeout(this.writeQueue.get(tableName));

            this.writeQueue.delete(tableName);
        };

        let dataToWrite = cache.data;
        if (this.noBlankData) dataToWrite = functions.removeEmptyData({ ...cache.data });

        functions.atomicWrite(
            this.dbFolder,
            tableName,
            dataToWrite,
            this.readable
        );

        cache.dirty = false;
    }

    flushAll() {
        for (const tableName of this.tableCache.keys()) {
            this.flushTable(tableName);
        }
    }

    isPlainObject(value) {
        return value && typeof value === 'object' && !Array.isArray(value);
    }

    syncFlush(tableName) {
        if (this.writeQueue.has(tableName)) {
            clearTimeout(this.writeQueue.get(tableName));

            this.writeQueue.delete(tableName);
        };

        this.flushTable(tableName);
    }

    set(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (data === undefined) throw new TypeError(this.message['errors']['blankData']);

        const tableName = this.getTableName(key);
        const tableKey = this.getTableKey(key);
        const tableData = this.getTableData(tableName);

        functions.set(tableKey, data, tableData, this.seperator);

        this.markDirty(tableName);
        this.syncFlush(tableName);

        return this.get(key);
    }

    get(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        const tableName = this.getTableName(key);
        const tableKey = this.getTableKey(key);
        const tableData = this.getTableData(tableName);

        try {
            return functions.get(tableData, this.seperator, ...tableKey.split(this.seperator));
        } catch (err) {
            return undefined;
        }
    }

    fetch(key) {
        return this.get(key);
    }

    type(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        const value = this.get(key);
        if (value === null) return 'null';
        if (value === undefined) return 'null';
        if (Array.isArray(value)) return 'array';

        return typeof value;
    }

    has(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        try {
            const value = this.get(key);

            return value !== undefined && value !== null;
        } catch (err) {
            return false;
        }
    }

    delete(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        const tableName = this.getTableName(key);
        const tableKey = this.getTableKey(key);
        const tableData = this.getTableData(tableName);

        if (!this.has(key)) return false;

        functions.remove(tableData, tableKey, this.seperator);
        if (this.noBlankData) functions.removeEmptyData(tableData);

        this.markDirty(tableName);
        this.syncFlush(tableName);

        return true;
    }

    del(key) {
        return this.delete(key);
    }

    add(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (value === undefined) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        const current = this.get(key);
        const newValue = Number(current ? (isNaN(current) ? Number(value) : current + Number(value)) : Number(value));

        this.set(key, newValue);
        return this.get(key);
    }

    subtract(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (value === undefined) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        const current = this.get(key);
        if (!current || current - value < 1) {
            this.delete(key);

            return this.get(key) || 0;
        };

        const newValue = current ? (current - Number(value) <= 1 ? 1 : (isNaN(current) ? 1 : current - Number(value)) || 1) : 1;
        this.set(key, newValue);

        return this.get(key);
    }

    sub(key, value) {
        return this.subtract(key, value);
    }

    push(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (data === undefined) throw new TypeError(this.message['errors']['blankData']);

        let arr = [];
        const current = this.get(key);
        if (current) {
            if (typeof current !== 'object' || !Array.isArray(current)) arr = [];
            else arr = current;
        };

        arr.push(data);
        this.set(key, arr);

        return this.get(key);
    }

    unpush(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (data === undefined) throw new TypeError(this.message['errors']['blankData']);

        let arr = [];
        const current = this.get(key);
        if (current) arr = current;

        arr = arr.filter((x) => x !== data);
        this.set(key, arr);

        return this.get(key);
    }

    delByPriority(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (value === undefined) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        const content = this.get(key);
        if (!content || content.length < 1) return false;
        if (typeof content !== 'object') return false;

        const newArr = [];
        for (let a = 0; a < content.length; a++) {
            if (a !== (value - 1)) newArr.push(content[a]);
        }

        this.set(key, newArr);
        return this.get(key);
    }

    setByPriority(key, data, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (data === undefined) throw new TypeError(this.message['errors']['blankData']);
        if (value === undefined) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        const content = this.get(key);
        if (!content || content.length < 1) return false;
        if (typeof content !== 'object') return false;

        const newArr = [];
        for (let a = 0; a < content.length; a++) {
            if (a === (value - 1)) newArr.push(data);
            else newArr.push(content[a]);
        }

        this.set(key, newArr);
        return this.get(key);
    }

    all(key = 'all') {
        key = key.toLowerCase();

        const allData = this.getAllData();
        if (key === 'all') return allData;
        else if (key === 'object') return Object.entries(allData);
        else if (key === 'keys') return Object.keys(allData);
        else if (key === 'values') return Object.values(allData);
        else return allData;
    }

    getAllData() {
        const allData = {};
        const tableFiles = functions.listTableFiles(this.dbFolder);

        for (const tableName of tableFiles) {
            const tableData = this.getTableData(tableName);

            if (tableName === this.defaultTable) {
                Object.assign(allData, tableData);
            } else {
                for (const [k, v] of Object.entries(tableData)) {
                    allData[`${tableName}${this.seperator}${k}`] = v;
                }
            };
        }

        return allData;
    }

    getAll() {
        return this.getAllData();
    }

    fetchAll() {
        return this.getAllData();
    }

    deleteAll() {
        const tableFiles = functions.listTableFiles(this.dbFolder);

        for (const tableName of tableFiles) {
            this.tableCache.set(tableName, { data: {}, dirty: true, loaded: true });
            this.syncFlush(tableName);
        }

        return true;
    }

    clear() {
        return this.deleteAll();
    }

    backup(file) {
        if (!file) throw new Error('Please provide a name for the backup file.');
        if (file.endsWith('.json')) throw new TypeError('File extensions should be omitted from the filename.');

        this.flushAll();
        functions.ensureFolder(file);

        const backupTables = functions.listTableFiles(file);
        for (const tableName of backupTables) {
            const backupFilePath = functions.getTableFilePath(file, tableName);

            if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
        }

        const tableNames = functions.listTableFiles(this.dbFolder);
        for (const tableName of tableNames) {
            const tableData = this.getTableData(tableName);

            functions.atomicWrite(file, tableName, tableData, this.readable);
        }

        return true;
    }

    loadBackup(filePath) {
        if (!fs.existsSync(filePath)) throw new Error('Please enter a correct file path.');

        this.destroy();
        functions.ensureFolder(this.dbFolder);

        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            const tableNames = functions.listTableFiles(filePath);

            for (const tableName of tableNames) {
                const backupTablePath = functions.getTableFilePath(filePath, tableName);
                const tableData = JSON.parse(fs.readFileSync(backupTablePath, 'utf8'));

                this.tableCache.set(tableName, { data: tableData, dirty: false, loaded: true });
                functions.atomicWrite(this.dbFolder, tableName, tableData, this.readable);
            }

            return true;
        };

        if (!filePath.includes('.json')) throw new TypeError('File in the path you show is not a json file.');

        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        for (const [key, value] of Object.entries(content)) {
            this.set(key, value);
        }

        return true;
    }

    startsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        const allData = this.getAllData();
        const array = [];

        for (const k in allData) {
            array.push({ key: k, data: allData[k] });
        }

        return array.filter(x => x.key.startsWith(key));
    }

    endsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        const allData = this.getAllData();
        const array = [];

        for (const k in allData) {
            array.push({ key: k, data: allData[k] });
        }

        return array.filter(x => x.key.endsWith(key));
    }

    includes(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        const allData = this.getAllData();
        const array = [];

        for (const k in allData) {
            array.push({ key: k, data: allData[k] });
        }

        return array.filter(x => x.key.includes(key));
    }

    destroy() {
        const tableFiles = functions.listTableFiles(this.dbFolder);

        for (const tableName of tableFiles) {
            const filePath = functions.getTableFilePath(this.dbFolder, tableName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        this.tableCache.clear();
        this.writeQueue.clear();

        return true;
    }

    ping() {
        const getStart = Date.now();
        this.get('mzrdb_ping_test');
        const readPing = Date.now() - getStart;

        const setStart = Date.now();
        this.set('mzrdb_ping_test', 'mzrdb');
        const writePing = Date.now() - setStart;

        const average = (readPing + writePing) / 2;
        this.delete('mzrdb_ping_test');

        return { read: `${readPing}ms`, write: `${writePing}ms`, average: `${average}ms` };
    }

    length(key = 'all') {
        if (key === 'all' || key.includes('word') || key.includes('char')) {
            const allData = JSON.stringify(this.getAllData());

            return allData.length;
        } else if (key === 'object' || key.includes('object')) {
            const allData = Object.entries(this.getAllData());

            return allData.length;
        };

        return JSON.stringify(this.getAllData()).length;
    }

    tables() {
        return functions.listTableFiles(this.dbFolder);
    }

    migrate(sourcePath) {
        const defaultSourceFile = path.join(this.dbFolder, `${this.dbName}.json`);
        let sourceFile = sourcePath || defaultSourceFile;

        if (!sourcePath && this.isEmptyObjectFile(defaultSourceFile)) {
            const fallbackSourceFile = path.join('.', this.dbName, `${this.dbName}.json`);

            if (path.resolve(fallbackSourceFile) !== path.resolve(defaultSourceFile) && fs.existsSync(fallbackSourceFile) && !this.isEmptyObjectFile(fallbackSourceFile)) sourceFile = fallbackSourceFile;
        };

        if (!fs.existsSync(sourceFile)) throw new Error(`Source file not found: ${sourceFile}`);

        const oldData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        let migratedCount = 0;
        let migratedTables = 0;

        this.destroy();
        functions.ensureFolder(this.dbFolder);
        this.ensureRootTableFile();

        for (const [key, value] of Object.entries(oldData)) {
            if (key.includes(this.seperator)) {
                this.set(key, value);
                migratedCount++;

                continue;
            };

            if (this.isPlainObject(value) && key !== this.defaultTable) {
                const tableData = this.noBlankData ? functions.removeEmptyData({ ...value }) : value;

                this.tableCache.set(key, { data: tableData, dirty: false, loaded: true });
                functions.atomicWrite(this.dbFolder, key, tableData, this.readable);

                migratedCount++;
                migratedTables++;

                continue;
            };

            this.set(key, value);
            migratedCount++;
        }

        const backupPath = sourceFile.replace('.json', '.backup.json');
        if (this.readable) fs.writeFileSync(backupPath, JSON.stringify(oldData, null, 2), 'utf8');
        else fs.copyFileSync(sourceFile, backupPath);

        console.log(`[MZRDB Migration] Migrated ${migratedCount} keys from ${sourceFile}`);
        if (migratedTables > 0) console.log(`[MZRDB Migration] Split ${migratedTables} top-level objects into table files`);

        console.log(`[MZRDB Migration] Original file backed up to ${backupPath}`);
        console.log(`[MZRDB Migration] Created tables: ${this.tables().join(', ')}`);

        return true;
    }

    find(key, query) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        return data.filter(doc =>
            Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
        ) || [];
    }

    findAndUpdate(key, query, update) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);
        if (typeof update !== 'object' || update === null) throw new TypeError(this.message['errors']['updateMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        const updatedDocs = data.map(doc => {
            const matches = Object.keys(query).every(queryKey =>
                queryKey in doc && doc[queryKey] === query[queryKey]
            );

            if (matches) {
                const oldDoc = { ...doc };
                const newDoc = { ...oldDoc, ...update };

                return { old: oldDoc, new: newDoc };
            };

            return null;
        }).filter(doc => doc !== null);

        if (updatedDocs.length > 0) {
            this.set(key, data.map(doc => {
                const matchingUpdate = updatedDocs.find(updatedDoc =>
                    Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
                );

                return matchingUpdate ? matchingUpdate.new : doc;
            }));
        };

        return updatedDocs;
    }

    findAndDelete(key, query) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        const deletedDocs = data.filter(doc =>
            Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
        );

        const updatedData = data.filter(doc => !deletedDocs.includes(doc));
        this.set(key, updatedData);

        return deletedDocs;
    }

    findOneAndUpdate(key, query, update) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);
        if (typeof update !== 'object' || update === null) throw new TypeError(this.message['errors']['updateMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        let oldDoc = null;
        let newDoc = null;

        const updatedData = data.map(doc => {
            if (oldDoc) return doc;

            const matches = Object.keys(query).every(queryKey =>
                queryKey in doc && doc[queryKey] === query[queryKey]
            );

            if (matches) {
                oldDoc = { ...doc };
                newDoc = { ...doc, ...update };

                return newDoc;
            };

            return doc;
        });

        if (oldDoc && newDoc) {
            this.set(key, updatedData);

            return { old: oldDoc, new: newDoc };
        } else {
            throw new Error(this.message['errors']['noDocMatchedQuery']);
        };
    }

    findOneAndDelete(key, query) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        let deletedDoc = null;

        const updatedData = data.filter(doc => {
            if (deletedDoc) return true;

            const matches = Object.keys(query).every(queryKey =>
                queryKey in doc && doc[queryKey] === query[queryKey]
            );

            if (matches) {
                deletedDoc = { ...doc };

                return false;
            };

            return true;
        });

        if (deletedDoc) {
            this.set(key, updatedData);

            return deletedDoc;
        } else {
            throw new Error(this.message['errors']['noDocMatchedQuery']);
        };
    }

    findOne(key, query) {
        if (typeof key !== 'string' || key.trim() === '') throw new TypeError(this.message['errors']['nonEmptyString']);
        if (typeof query !== 'object' || query === null) throw new TypeError(this.message['errors']['queryMustObjects']);

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        return data.find(doc =>
            Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
        ) || null;
    }

    async uptime() {
        throw new Error('Uptime feature is not applicable for Multi-file Json database.');
    }

    async connecetion() {
        throw new Error('Connecetion feature is not applicable for Multi-file Json database.');
    }

    async disconnect() {
        throw new Error('Disconnect feature is not applicable for Multi-file Json database.');
    }

    async exports() {
        throw new Error('Exports feature is not applicable for Multi-file Json database.');
    }

    async export() {
        throw new Error('Export feature is not applicable for Multi-file Json database.');
    }
}

module.exports = MultiFileJsonDB;