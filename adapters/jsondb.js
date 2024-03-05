'use strict';

const fs = require('fs');
const functions = require('../functions/jsondb.js');

class JsonDB {
  constructor(options) {
    this.dbName = options['dbName'];
    this.dbFolder = options['dbFolder'];
    this.noBlankData = options['noBlankData'] ? (typeof options['noBlankData'] === 'boolean' ? options['noBlankData'] : false) : false;
    this.readable = options['readable'] ? (typeof options['readable'] === 'boolean' ? true : false) : false;

    functions.fetchFiles(this.dbFolder, this.dbName);
  }

  set(key, data) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));
    functions.set(key, data, content);

    if (this.readable) fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content, null, 2));
    else fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content));

    return this.get(key);
  }

  get(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    try {
      return functions.get(content, ...key.split('.'));
    } catch (err) {
      return undefined;
    }
  }

  fetch(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    try {
      return functions.get(content, ...key.split('.'));
    } catch (err) {
      return undefined;
    }
  }

  type(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    try {
      return functions.get(content, ...key.split('.')) ? typeof functions.get(content, ...key.split('.')) : null;
    } catch (err) {
      return null;
    }
  }

  has(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    try {
      return functions.get(content, ...key.split('.')) ? true : false;
    } catch (err) {
      return false;
    }
  }

  delete(key) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));
    if (!this.get(key)) return false;

    functions.remove(content, key);

    if (this.noBlankData === true) functions.removeEmptyData(content);
    if (this.readable) fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content, null, 2));
    else fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content));

    return true;
  }

  del(key) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));
    if (!this.get(key)) return false;

    functions.remove(content, key);

    if (this.noBlankData === true) functions.removeEmptyData(content);
    if (this.readable) fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content, null, 2));
    else fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content));

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
    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));
    key = key.toLowerCase();

    if (key === 'all') return content;
    else if (key === 'object') return Object.entries(content);
    else if (key === 'keys') return Object.keys(content);
    else if (key === 'values') return Object.values(content);
    else return content;
  }

  getAll() {
    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    return content;
  }

  fetchAll() {
    var content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    return content;
  }

  deleteAll() {
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify({}));

    return true;
  }

  clear() {
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify({}));

    return true;
  }

  backup(file) {
    if (!file) throw new Error('Please provide a name for the backup file.');
    if (file.endsWith('.json')) throw new TypeError('File extensions should be omitted from the filename.');
    if (file === this.dbName) throw new Error('Backup database name cannot be identical to the original database name.');

    functions.fetchFiles(this.dbFolder, this.dbName);

    const path = fs.realpathSync(`./${this.dbFolder}/${this.dbName}.json`);
    const content = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (this.readable) fs.writeFileSync(`${file}.json`, JSON.stringify(content, null, 2));
    else fs.writeFileSync(`${file}.json`, JSON.stringify(content));

    return true;
  }

  startsWith(key) {
    if (!key) throw new Error('Key not specified.');
    if (typeof key !== 'string') throw new TypeError('Key must be a string.');

    functions.fetchFiles(this.dbFolder, this.dbName);
    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    const array = [];
    for (const key in content) {
      array.push({ key, data: content[key] });
    }

    return array.filter(x => x.key.startsWith(key));
  }

  endsWith(key) {
    if (!key) throw new Error('Key not specified.');
    if (typeof key !== 'string') throw new TypeError('Key must be a string.');

    functions.fetchFiles(this.dbFolder, this.dbName);
    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    const array = [];
    for (const key in content) {
      array.push({ key, data: content[key] });
    }

    return array.filter(x => x.key.endsWith(key));
  }

  includes(key) {
    if (!key) throw new Error('Key not specified.');
    if (typeof key !== 'string') throw new TypeError('Key must be a string.');

    functions.fetchFiles(this.dbFolder, this.dbName);
    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, 'utf8'));

    const array = [];
    for (const key in content) {
      array.push({ key, data: content[key] });
    }

    return array.filter(x => x.key.includes(key));
  }

  destroy() {
    fs.unlink(`${this.dbFolder}/${this.dbName}.json`, () => {
      fs.rmdir(this.dbName, { recursive: false }, () => { });
    });

    return true;
  }
}

module.exports = JsonDB;