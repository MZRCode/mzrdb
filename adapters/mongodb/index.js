'use strict';

const Base = require('./Base');
const Schema = require('./Schema');
const functions = require('../../functions/mongodb');
const $ = require('lodash');

class MongoDB extends Base {
    constructor(options) {
        super(options['url']);

        this.schema = options.schema ? Schema(options.schema) : Schema('mzrdb');
        this.seperator = options['seperator'];
    }

    async set(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        if (key.includes(this.seperator)) {
            var content = await this.schema.findOne({
                key: key.split(this.seperator).shift()
            });

            if (!content) {
                var content = {};

                functions.set(key.split(this.seperator).slice(1).join(this.seperator), data, content, this.seperator);
                await this.schema.findOneAndUpdate({ key: key.split(this.seperator).shift() }, { value: content }, { upsert: true });

                return data;
            } else {
                const prev = Object.assign({}, content.value);

                functions.set(key.split(this.seperator).slice(1).join(this.seperator), data, prev, this.seperator);
                await this.schema.findOneAndUpdate({ key: key.split(this.seperator).shift() }, { value: prev }, { upsert: true });

                return data;
            };
        } else {
            await this.schema.findOneAndUpdate({ key: key }, { value: data }, { upsert: true });

            return data;
        };
    }

    async get(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        if (key.includes(this.seperator)) {
            let content = await this.schema.findOne({
                key: key.split(this.seperator).shift()
            });

            if (!content) return undefined;

            return $.get(content.value, key.split(this.seperator).slice(1).join(this.seperator));
        } else {
            let content = await this.schema.findOne({
                key: key
            });

            if (!content) return undefined;

            return content.value;
        };
    }

    async fetch(key) {
        return await this.get(key);
    }

    async type(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (typeof key != 'string') throw new Error(this.message['errors']['blankType']);
        let data = await this.get(key);

        if (data === null) return 'null';
        else if (Array.isArray(data)) return 'array';

        return data !== undefined ? typeof data : 'null';
    }

    async has(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        return ((await this.get(key)) ? true : false);
    }

    async delete(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        if (key.includes(this.seperator)) {
            let content = await this.get(key.split(this.seperator).shift());
            if (!content) return true;

            const newContent = Object.assign({}, content);
            functions.remove(newContent, key.split(this.seperator).slice(1).join(this.seperator), this.seperator);
            this.set(key.split(this.seperator).shift(), newContent);

            setTimeout(async () => {
                var newData = await this.get(db.split(this.seperator).slice(0, db.split(this.seperator).length - 1).join(this.seperator));
                if (typeof newData === 'object' && Object.keys(newData).length === 0) await this.delete(db.split(this.seperator).slice(0, db.split(this.seperator).length - 1).join(this.seperator))
            }, 250);
        } else {
            await this.schema.findOneAndDelete({
                key: key
            });
        };

        return true;
    }

    async del(key) {
        return await this.delete(key);
    }

    async add(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        let content = await this.get(key);

        if (!content) {
            await this.set(key, value);

            return value;
        } else {
            await this.set(key, content + value)

            return content + value;
        };
    }

    async subtract(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        const content = await this.get(key);
        let newNumber = content - value;

        if (!isNaN(content)) {
            if (newNumber <= 0) {
                await this.delete(key);

                return 0;
            } else {
                return await this.set(key, newNumber);
            };
        } else {
            return 0;
        };
    }

    async sub(key, value) {
        return await this.subtract(key, value);
    }

    async push(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (await this.get(key)) {
            if (typeof (await this.get(key)) !== 'object') arr = [];
            else arr = await this.get(key);
        };

        arr.push(data);
        await this.set(key, arr);

        return await this.get(key);
    }

    async unpush(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (this.get(key)) arr = await this.get(key);

        arr = arr.filter((x) => x !== data);
        await this.set(key, arr);

        return await this.get(key);
    }

    async delByPriority(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!(await this.get(key)) || (await this.get(key)).length < 1) return false;

        let content = await this.get(key);
        let neww = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            if (a !== (value - 1)) neww.push(content[`${a}`]);
        }

        await this.set(key, neww);
        return await this.get(key);
    }

    async setByPriority(key, data, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!(await this.get(key)) || (await this.get(key)).length < 1) return false;

        let content = await this.get(key);
        let neww = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            let val = content[`${a}`];

            if (a === (value - 1)) neww.push(data);
            else neww.push(val);
        }

        await this.set(key, neww);
        return await this.get(key);
    }

    async all() {
        let content = await this.schema.find({});

        return content;
    }

    async getAll() {
        return await this.all();
    }

    async fetchAll() {
        return await this.all();
    }

    async deleteAll() {
        await this.schema.deleteMany();

        return true;
    }

    async clear() {
        return await this.deleteAll();
    }

    async backup(fileName = 'mongodb-backup') {
        if (fileName.includes(this.seperator)) throw new TypeError('Please do not include the dot symbol in the name or extensions such as .json etc.');

        const fs = require('fs');
        return await this.all().then(async (data) => {
            const convertedData = await convertData(data);

            if (fileName) {
                fs.writeFileSync(`${fileName}.json`, convertedData);

                return `${fileName}`;
            };

            return true;
        }).catch((e) => e);
    }

    async startsWith() {
        throw new Error('StartsWith feature is not applicable for Mongo database.');
    }

    async endsWith() {
        throw new Error('EndsWith feature is not applicable for Mongo database.');
    }

    async includes() {
        throw new Error('Includes feature is not applicable for Mongo database.');
    }

    async loadBackup() {
        throw new Error('LoadBackup feature is not applicable for Mongo database.');
    }

    async setReadable() {
        throw new Error('SetReadable feature is not applicable for Mongo database.');
    }

    async setNoBlankData() {
        throw new Error('setNoBlankData feature is not applicable for Mongo database.');
    }

    async destroy() {
        await this.clear();

        return true;
    }

    async ping() {
        const getStart = Date.now();
        await this.get('mzrdb_ping');
        const readPing = Date.now() - getStart;

        const setStart = Date.now();
        await this.set('mzrdb_ping', 'ping');
        const writePing = Date.now() - setStart;

        const average = (readPing + writePing) / 2;
        await this.delete('mzrdb_ping');

        return { read: `${readPing}ms`, write: `${writePing}ms`, average: `${average}ms` };
    }

    async export(fileName = 'mongodb') {
        if (fileName.includes(this.seperator)) throw new TypeError('Please do not include the dot symbol in the name or extensions such as .json etc.');

        const fs = require('fs');
        return await this.all().then(async (data) => {
            const convertedData = await convertData(data);

            if (fileName) {
                fs.writeFileSync(`${fileName}.json`, convertedData);

                return true;
            };

            return true
        }).catch((e) => e);
    }

    async uptime() {
        if (!this.readyMongo) return 0;

        return Date.now() - this.readyMongo.getTime();
    }

    async connection() {
        this._state();
        return true;
    }

    async disconnect() {
        return this._destroyDatabase();
    }

    async length(key = 'all') {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const all = await this.all() || [];
                    const length = all.length || 0;

                    resolve(length);
                } catch (error) {
                    if (error.errno == -4058) reject("mzrdb module is not installed! You can type 'npm i mzrdb@latest' to install it.")
                    else reject('An error occurred! Here is the error that occurred: ' + error.message);
                }
            })();
        });
    }

    async find(key, query) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError('Key must be a non-empty string.');
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError('Query must be an object.');
        };

        const data = await this.get(key) || [];
        if (!Array.isArray(data)) throw new Error('Data must be an array.');

        return data.filter(doc => Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])) || [];
    }
}

async function convertData(data) {
    try {
        const outputData = {};

        data.forEach((item) => {
            const key = item.key;
            const value = item.value;

            const nestedKeys = key.split('-');
            let currentObject = outputData;

            nestedKeys.forEach((nestedKey, index) => {
                if (!currentObject[nestedKey]) {
                    if (index === nestedKeys.length - 1) currentObject[nestedKey] = value;
                    else currentObject[nestedKey] = {};
                };

                currentObject = currentObject[nestedKey];
            });
        });

        return JSON.stringify(outputData);
    } catch (error) {
        throw new Error('Error converting data: ' + error.message);
    }
}

module.exports = MongoDB;