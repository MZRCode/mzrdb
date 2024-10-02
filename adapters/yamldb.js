'use strict';

const fs = require('fs');
const functions = require('../functions/yamldb.js');
let yaml;

class YamlDB {
  constructor(options) {
    this.dbName = options['dbName'];
    this.dbFolder = options['dbFolder'];
    this.readable = options['readable'] ? (typeof options['readable'] === 'boolean' ? true : false) : false;
    this.seperator = options['seperator'];
    this.message = options['message'];

    try {
      yaml = require('yaml');
    } catch (error) {
      throw new TypeError('You must install \'yaml\' module for use this adapter. (npm i yaml)');
    }

    functions.fetchFiles(this.dbFolder, this.dbName);
  }

  set(key, data) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));
    functions.set(key, data, content, this.seperator);
    if (this.readable) fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify(content, null, 2));
    else fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify(content));

    return this.get(key);
  }

  get(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    try {
      return functions.get(content, this.seperator, ...key.split(this.seperator));
    } catch (err) {
      return undefined;
    }
  }

  fetch(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    try {
      return functions.get(content, this.seperator, ...key.split(this.seperator));
    } catch (err) {
      return undefined;
    }
  }

  has(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    try {
      return functions.get(content, this.seperator, ...key.split(this.seperator)) ? true : false;
    } catch (err) {
      return false;
    }
  }

  type(key) {
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    try {
      const value = functions.get(content, this.seperator, ...key.split(this.seperator));

      if (value === null) return 'null';
      else if (Array.isArray(value)) return 'array';

      return value !== undefined ? typeof value : 'null';
    } catch (err) {
      return null;
    }
  }

  delete(key) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if (!key) throw new TypeError(this.message['errors']['blankName']);

    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));
    if (!this.get(key)) return false;

    functions.remove(content, key, this.seperator);

    if (this.readable) fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify(content, null, 2));
    else fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify(content));

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
    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));
    key = key.toLowerCase();

    if (key === 'all') return content;
    else if (key === 'object') return Object.entries(content);
    else if (key === 'keys') return Object.keys(content);
    else if (key === 'values') return Object.values(content);
    else return content;
  }

  getAll() {
    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    return content;
  }

  fetchAll() {
    var content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    return content;
  }

  deleteAll() {
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify({}));

    return true;
  }

  clear() {
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, yaml.stringify({}));

    return true;
  }

  backup(file) {
    if (!file) throw new Error('Please provide a name for the backup file.');
    if (file.endsWith('.yaml')) throw new Error('File extensions should be omitted from the filename.');
    if (file === this.dbName) throw new Error('Backup database name cannot be identical to the original database name.');

    functions.fetchFiles(this.dbFolder, this.dbName);

    const path = fs.realpathSync(`./${this.dbFolder}/${this.dbName}.yaml`);
    const content = yaml.parse(fs.readFileSync(path, 'utf8'));

    if (this.readable) fs.writeFileSync(`${file}.yaml`, yaml.stringify(content, null, 2));
    else fs.writeFileSync(`${file}.yaml`, yaml.stringify(content));

    return true;
  }

  startsWith(key) {
    if (!key) throw new Error('Key not specified.');
    if (typeof key !== 'string') throw new TypeError('Key must be a string.');

    functions.fetchFiles(this.dbFolder, this.dbName);
    const content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

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
    const content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

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
    const content = yaml.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8'));

    const array = [];
    for (const key in content) {
      array.push({ key, data: content[key] });
    }

    return array.filter(x => x.key.includes(key));
  }

  destroy() {
    fs.unlink(`${this.dbFolder}/${this.dbName}.yaml`, () => {
      fs.rmdir(this.dbName, { recursive: false }, () => { });
    });

    return true;
  }

  ping() {
    functions.fetchFiles(this.dbFolder, this.dbName);

    const getStart = Date.now();
    this.get('mzrdb');
    const readPing = Date.now() - getStart;

    const setStart = Date.now();
    this.set('mzrdb', 'mzrdb');
    const writePing = Date.now() - setStart;

    const average = (readPing + writePing) / 2;
    this.delete('mzrdb');

    return { read: `${readPing}ms`, write: `${writePing}ms`, average: `${average}ms` };
  }

  loadBackup(path) {
    if (!path.includes('.yaml')) throw new TypeError('File in the path you show is not a yaml file.');
    if (fs.existsSync(`${path}`) === false) throw new Error('Please enter a correct file path.');
    functions.fetchFiles(this.dbFolder, this.dbName);

    const filePath = fs.realpathSync(`${path}`);
    const dbPath = fs.realpathSync(`./${this.dbFolder}/${this.dbName}.yaml`);

    fs.writeFile(dbPath, fs.readFileSync(filePath, 'utf8'), (err) => {
      if (err) throw new Error(err);
    });

    return true;
  }

  async uptime() {
    throw new Error('Uptime feature is not applicable for Yaml database.');
  }

  async connecetion() {
    throw new Error('Connecetion feature is not applicable for Yaml database.');
  }

  async disconnect() {
    throw new Error('Disconnect feature is not applicable for Yaml database.');
  }

  async exports() {
    throw new Error('Exports feature is not applicable for Yaml database.');
  }

  async export() {
    throw new Error('Export feature is not applicable for Yaml database.');
  }

  moveToMongo() {
    throw new Error('Move to Mongo feature is not applicable for Yaml database.');
  }

  setNoBlankData() {
    throw new Error('setNoBlankData feature is not applicable for Yaml database.');
  }

  length(key = 'all') {
    if (key === 'all') key = 'all';
    else if (key.includes('word')) key = 'all';
    else if (key.includes('char')) key = 'all';
    else if (key.includes('object')) key = 'object';
    else key = 'all';

    try {
      if (key === 'object') {
        const allData = Object.entries(JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8')));

        return allData.length;
      } else {
        const allData = fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, 'utf8');

        return allData.length;
      };
    } catch {
      if (error.errno == -4058) throw new Error("mzrdb module is not installed! You can type 'npm i mzrdb@latest' to install it.")
      else throw new Error('An error occurred! Here is the error that occurred: ' + error.message);
    };
  }

  find(key, query) {
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

    const data = this.get(key) || [];
    if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

    return data.filter(doc => Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])) || [];
  }

  findAndUpdate(key, query, update) {
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

    if (typeof update !== 'object' || update === null) {
      throw new TypeError(this.message['errors']['updateMustObjects']);
    };

    const data = this.get(key) || [];
    if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

    const updatedDocs = data.map(doc => {
      const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);
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
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

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
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

    if (typeof update !== 'object' || update === null) {
      throw new TypeError(this.message['errors']['updateMustObjects']);
    };

    const data = this.get(key) || [];
    if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

    let oldDoc = null;
    let newDoc = null;

    const updatedData = data.map(doc => {
      const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);

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
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

    const data = this.get(key) || [];
    if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

    let deletedDoc = null;

    const updatedData = data.filter(doc => {
      const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);
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
    if (typeof key !== 'string' || key.trim() === '') {
      throw new TypeError(this.message['errors']['nonEmptyString']);
    };

    if (typeof query !== 'object' || query === null) {
      throw new TypeError(this.message['errors']['queryMustObjects']);
    };

    const data = this.get(key) || [];
    if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

    return data.find(doc => Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])) || null;
  }
}

module.exports = YamlDB;