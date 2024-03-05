const fs = require('fs');
const functions = require('../functions/bsondb.js');
let bson;

class BsonDB {
    constructor(options) {
        this.dbName = options['dbName'];
        this.dbFolder = options['dbFolder'];
        this.noBlankData = options['noBlankData'] ? (typeof options['noBlankData'] === 'boolean' ? options['noBlankData'] : false) : false;
        this.readable = options['readable'] ? (typeof options['readable'] === 'boolean' ? true : false) : false;

        try {
            bson = require('bson');
        } catch (error) {
            throw new TypeError('You must install \'bson\' module for use this adapter. (npm i bson)');
        }

        functions.fetchFiles(this.dbFolder, this.dbName);
        this.content = this.readBSONFile();
    }

    readBSONFile() {
        const content = fs.readFileSync(`./${this.dbFolder}/${this.dbName}.bson`);

        return bson.deserialize(content);
    }

    writeBSONFile() {
        const serializedContent = bson.serialize(this.content);

        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, serializedContent);
    }

    set(key, data) {
        functions.set(key, data, this.content);
        this.writeBSONFile();

        return this.get(key);
    }

    get(key) {
        return functions.get(this.content, ...key.split('.'));
    }

    fetch(key) {
        return functions.get(this.content, ...key.split('.'));
    }

    has(key) {
        return functions.get(this.content, ...key.split('.')) ? true : false;
    }

    type(key) {
        return functions.get(this.content, ...key.split('.')) ? typeof functions.get(this.content, ...key.split('.')) : null;
    }

    delete(key) {
        if (!this.get(key)) return false;
        functions.remove(this.content, key);
        if (this.noBlankData === true) functions.removeEmptyData(this.content);
        this.writeBSONFile();

        return true;
    }

    del(key) {
        if (!this.get(key)) return false;
        functions.remove(this.content, key);
        if (this.noBlankData === true) functions.removeEmptyData(this.content);
        this.writeBSONFile();

        return true;
    }

    delete(key) {
        if (!this.get(key)) return false;
        functions.remove(this.content, key);
        if (this.noBlankData === true) functions.removeEmptyData(this.content);
        this.writeBSONFile();

        return true;
    }

    add(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        this.set(key, Number(this.get(key) ? (isNaN(this.get(key)) ? Number(value) : this.get(key) + Number(value)) : Number(value)));

        return this.get(key);
    }

    subtract(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        if (this.get(key) - value < 1) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        if (!this.get(key)) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        this.set(key, this.get(key) ? (this.get(key) - Number(value) <= 1 ? 1 : (isNaN(this.get(key)) ? 1 : this.get(key) - Number(value)) || 1) : 1);
        return this.get(key);
    }

    sub(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        if (this.get(key) - value < 1) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        if (!this.get(key)) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        this.set(key, this.get(key) ? (this.get(key) - Number(value) <= 1 ? 1 : (isNaN(this.get(key)) ? 1 : this.get(key) - Number(value)) || 1) : 1);
        return this.get(key);
    }

    push(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (this.get(key)) {
            if (typeof this.get(key) !== 'object') arr = [];
            else arr = this.get(key);
        };

        arr.push(data);

        this.set(key, arr);

        return this.get(key);
    }

    unpush(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (this.get(key)) arr = this.get(key);
        arr = arr.filter((x) => x !== data);

        this.set(key, arr);
        return this.get(key);
    }

    delByPriority(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!this.get(key) || this.get(key).length < 1) return false;

        let content = this.get(key);
        let neW = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            if (a !== (value - 1)) neW.push(content[`${a}`]);
        }

        this.set(key, neW);
        return this.get(key);
    }

    setByPriority(key, data, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!this.get(key) || this.get(key).length < 1) return false;

        let content = this.get(key);
        let neW = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            let val = content[`${a}`];

            if (a === (value - 1)) neW.push(data);
            else neW.push(val);
        }

        this.set(key, neW);
        return this.get(key);
    }

    all(key = 'all') {
        key = key.toLowerCase();

        if (key === 'all') return this.content;
        else if (key === 'object') return Object.entries(this.content);
        else if (key === 'keys') return Object.keys(this.content);
        else if (key === 'values') return Object.values(this.content);
        else return this.content;
    }

    getAll() {
        return this.content;
    }

    fetchAll() {
        return this.content;
    }

    deleteAll() {
        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, bson.serialize({}));

        return true;
    }

    clear() {
        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, bson.serialize({}));

        return true;
    }

    backup(file) {
        if (!file) throw new Error('Please provide a name for the backup file.');
        if (file.endsWith('.bson')) throw new Error('File extensions should be omitted from the filename.');
        if (file === this.dbName) throw new Error('Backup database name cannot be identical to the original database name.');

        fs.writeFileSync(`${file}.bson`, bson.serialize(this.content), 'utf8');

        return true;
    }

    startsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.startsWith(key));
    }

    endsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.endsWith(key));
    }

    includes(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.includes(key));
    }

    destroy() {
        fs.unlink(`${this.dbFolder}/${this.dbName}.bson`, () => {
            fs.rmdir(this.dbName, { recursive: false }, () => { });
        });

        return true;
    }
}

module.exports = BsonDB;