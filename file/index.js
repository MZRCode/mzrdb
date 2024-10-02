const langs = ['tr', 'en'];

module.exports = {
  setOptions() {
    var adapter = this.adapter || require('../adapters/jsondb');
    var adapterName = this.adapterName || 'json';

    if (this.mongoOptions?.schema) this.isMongoSpecialSchema = true;
    else this.isMongoSpecialSchema = false;

    this.message = this.lang ? require(`../language/${this.lang.toLowerCase()}.json`) : require(`../language/en.json`);

    this.options = {
      dbName: this.file || 'mzrdb',
      dbFolder: this.folder || 'mzrdb',
      noBlankData: this.noBlankData || false,
      readable: this.readable || false,
      language: this.lang ? this.lang : 'en',
      checkUpdates: this.checkUpdates || true,
      isMongo: this.mongo,
      mongoOptions: this.mongoOptions || { seperator: this.seperator || '.' },
      isMongoSpecialSchema: this.isMongoSpecialSchema,
      seperator: this.seperator || '.',
      message: this.message
    };

    this.options.mongoOptions.seperator = this.options.seperator;

    this.adapter = adapter.set ? adapter : (this.mongo ? new adapter(this.options.mongoOptions) : new adapter(this.options));
    this.adapterName = adapterName ? adapterName : 'json';

    if (this.checkUpdates) {
      try {
        fetch('https://registry.npmjs.org/mzrdb/latest').then(async (res) => {
          res.json().then((data) => {
            if (require('../package.json').version !== data.version) console.warn(this.message['errors']['oldVersion'])
          });
        });
      } catch (err) { }
    };
  },

  setCheckUpdates(bool) {
    if (bool === true) {
      this.checkUpdates = true;
      this.setOptions();

      return bool;
    } else {
      this.checkUpdates = false;
      this.setOptions();

      return false;
    };
  },

  setSeperator(key) {
    this.seperator = key;
    this.options.seperator = key;
    this.options.mongoOptions.seperator = key;
    this.setOptions();

    return true;
  },

  setLanguage(lang) {
    this.lang = lang ? (langs.includes(lang.toLowerCase()) ? lang.toLowerCase() : 'en') : 'en';
    this.message = require(`../language/${this.lang.toLowerCase()}.json`);
    this.setOptions();

    return lang;
  },

  setAdapter(adapter, options = { seperator: this.options?.seperator ?? '.' }) {
    if (adapter.length < 1) throw new TypeError(this.message['errors']['blankName']);

    const adapters = ['mongodb', 'jsondb', 'bsondb', 'yamldb'];
    if (!adapters.includes(adapter)) throw new TypeError('Please write down one of the adapters we support. (jsondb / mongodb / bsondb / yamldb)');

    if (adapter !== 'mongodb') {
      var adapterRequire = require('../adapters/' + adapter) || require('../adapters/jsondb');

      this.adapter = adapterRequire;
      this.mongo = false;

      this.adapterName = adapter.slice(0, -2);
      this.setOptions();

      return true;
    } else {
      try {
        require('mongoose');
      } catch {
        throw new Error("You must install 'mongoose' modules to use this adapter.");
      }

      this.adapterName = adapter.slice(0, -2);
      var adapter = require('../adapters/mongodb/index');

      this.adapter = adapter;
      this.mongo = true;
      this.mongoOptions = options;

      this.setOptions();

      return true;
    };
  },

  setFolder(folder) {
    this.folder = folder;
    this.setOptions();

    return true;
  },

  setFile(file) {
    this.file = file;
    this.setOptions();

    return true;
  },

  setReadable(boolean) {
    this.readable = boolean ? (typeof boolean === 'boolean' ? true : false) : false;
    this.setOptions();

    return this.readable;
  },

  setNoBlankData(boolean) {
    this.noBlankData = boolean ? (typeof boolean === 'boolean' ? boolean : false) : false;
    this.setOptions();

    return this.noBlankData;
  },

  set(key, data) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);

    return this.adapter.set(key, data);
  },

  get(key) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.get(key);
    } catch (err) {
      return undefined;
    }
  },

  fetch(key) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.fetch(key);
    } catch (err) {
      return undefined;
    }
  },

  has(key) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.has(key);
    } catch (err) {
      return false;
    }
  },

  check(key) {
    this.has(key);
  },

  type(key) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.type(key);
    } catch (err) {
      return null;
    }
  },

  delete(key) {
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.delete(key);
    } catch (err) {
      return false;
    }
  },

  del(key) {
    this.delete(key);
  },

  add(key, value) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!value) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankNumber']);

    return this.adapter.add(key, value);
  },

  subtract(key, value) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!value) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankNumber']);

    return this.adapter.subtract(key, value);
  },

  sub(key, value) {
    this.subtract(key, value);
  },

  push(key, data) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);

    return this.adapter.push(key, data);
  },

  unpush(key, data) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);

    return this.adapter.unpush(key, data);
  },

  delByPriority(key, value) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!value) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankNumber']);

    return this.adapter.delByPriority(key, value);
  },

  setByPriority(key, data, value) {
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!data) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankNumber']);

    return this.adapter.delByPriority(key, value);
  },

  all(key = 'all') {
    this.setOptions();
    key = key.toLowerCase();

    return this.adapter.all(key);
  },

  getAll() {
    this.setOptions();

    return this.adapter.getAll();
  },

  fetchAll() {
    this.setOptions();

    return this.adapter.fetchAll();
  },

  deleteAll() {
    this.setOptions();

    return this.adapter.deleteAll();
  },

  clear() {
    this.setOptions();

    return this.adapter.clear();
  },

  backup(file) {
    this.setOptions();

    return this.adapter.backup(file);
  },

  move(quickDB) {
    console.log('QuickDB to mzrdb json: Started copying database.');

    quickDB.fetchAll().map((data) => {
      this.adapter.set(data.ID, data.data)
      console.log(`QuickDB to mzrdb json: Copied ${data.ID}`)
    });

    return true;
  },


  get version() {
    return require('../package.json').version;
  },

  get size() {
    this.setOptions();

    let dbName = null;
    let dbFolder = null;
    try {
      dbName = this.options ? this.options['dbName'] : 'mzrdb';
      dbFolder = this.options ? this.options['dbFolder'] : 'mzrdb';
    } catch (error) {
      throw new TypeError(this.message['errors']['blankName']);
    }

    if (dbName && dbFolder) {
      try {
        const fs = require('fs');

        const filePath = fs.realpathSync(`./${dbFolder}/${dbName}.${this.adapterName ?? 'json'}`);

        const stats = fs.statSync(filePath);
        const dosyaBveriutu = stats.size;

        if (dosyaBveriutu < 1024) return `${dosyaBveriutu} Bytes`;
        else if (dosyaBveriutu < 1024 * 1024) return `${(dosyaBveriutu / 1024).toFixed(2)} Kb`;
        else if (dosyaBveriutu < 1024 * 1024 * 1024) return `${(dosyaBveriutu / (1024 * 1024)).toFixed(2)} Mb`;
        else return `${(dosyaBveriutu / (1024 * 1024 * 1024)).toFixed(2)} Gb`;
      } catch (error) {
        if (error.errno == -4058) throw new Error("mzrdb module is not installed! You can type 'npm i mzrdb@latest' to install it.")
        else throw new Error('An error occurred! Here is the error that occurred: ' + error.message);
      }
    };
  },

  length(key = 'all') {
    this.setOptions();

    return this.adapter.length(key);
  },

  startsWith(key) {
    this.setOptions();

    return this.adapter.startsWith(key);
  },

  endsWith(key) {
    this.setOptions();

    return this.adapter.endsWith(key);
  },

  includes(key) {
    this.setOptions();

    return this.adapter.includes(key);
  },

  destroy() {
    this.setOptions();

    return this.adapter.destroy();
  },

  get ping() {
    this.setOptions();

    return this.adapter.ping();
  },

  loadBackup(filePath) {
    this.setOptions();

    if (!filePath) throw new TypeError(this.message['errors']['blankData']);
    if (typeof filePath !== 'string') throw new TypeError(this.message['errors']['blankType']);

    return this.adapter.loadBackup(filePath);
  },

  deleteMongo() {
    var adapter = require('../adapters/jsondb');

    this.adapter = adapter;
    this.mongo = false;
    this.setOptions();

    return true;
  },

  moveToMongo(jsondb) {
    console.log('[MZRDB - JSON TO MONGO] Started copying database.');

    Object.keys(jsondb).map(async (data) => {
      await this.adapter.set(data, jsondb[data]);

      console.log(`[MZRDB - JSON TO MONGO] Copied ${data}`);
    });

    return true;
  },

  uptime() {
    this.setOptions();

    return this.adapter.uptime();
  },

  connection() {
    this.setOptions();

    return this.adapter.connection();
  },

  disconnect() {
    this.setOptions();

    return this.adapter.disconnect();
  },

  exports(fileName) {
    this.setOptions();

    return this.adapter.export(fileName);
  },

  find(key, query) {
    this.setOptions();

    return this.adapter.find(key, query);
  },

  findAndUpdate(key, query, update) {
    this.setOptions();

    return this.adapter.findAndUpdate(key, query, update);
  },

  findAndDelete(key, query) {
    this.setOptions();

    return this.adapter.findAndDelete(key, query);
  },

  findOneAndUpdate(key, query, update) {
    this.setOptions();

    return this.adapter.findOneAndUpdate(key, query, update);
  },

  findOneAndDelete(key, query) {
    this.setOptions();

    return this.adapter.findOneAndDelete(key, query);
  },

  findOne(key, query) {
    this.setOptions();

    return this.adapter.findOne(key, query);
  },
}