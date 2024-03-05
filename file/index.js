const langs = ['tr', 'en'];

module.exports = {
  setOptions() {
    var adapter = this.adapter || require('../adapters/jsondb');
    var adapterName = this.adapterName || 'json';

    this.options = {
      dbName: this.file || 'mzrdb',
      dbFolder: this.folder || 'mzrdb',
      noBlankData: this.noBlankData || false,
      readable: this.readable || false,
      language: this.lang ? this.lang : 'en',
      checkUpdates: this.checkUpdates || true
    };

    this.message = this.lang ? require(`../language/${this.lang.toLowerCase()}.json`) : require(`../language/en.json`);
    this.adapter = adapter.set ? adapter : new adapter(this.options);
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

  setLanguage(lang) {
    this.lang = lang ? (langs.includes(lang.toLowerCase()) ? lang.toLowerCase() : 'en') : 'en';
    this.message = require(`../language/${this.lang.toLowerCase()}.json`);
    this.setOptions();

    return lang;
  },

  setAdapter(adapter) {
    if (adapter.length < 1) throw new TypeError(this.message['errors']['blankName']);

    try {
      var Adapter = require('../adapters/' + adapter) || require('../adapters/jsondb');
    } catch {
      throw new TypeError('Please write down one of the adapters we support. (jsondb / bsondb / yamldb)');
    }

    this.adapter = Adapter;

    this.adapterName = adapter.slice(0, -2);
    this.setOptions();

    return true;
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
    this.setOptions();
    if (!key) throw new TypeError(this.message['errors']['blankName']);

    try {
      return this.adapter.del(key);
    } catch (err) {
      return false;
    }
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
    this.setOptions();

    if (!key) throw new TypeError(this.message['errors']['blankName']);
    if (!value) throw new TypeError(this.message['errors']['blankData']);
    if (!value) throw new TypeError(this.message['errors']['blankNumber']);

    return this.adapter.sub(key, value);
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
    console.log('QuickDB to mzrdb: Started copying database.')
    quickDB.fetchAll().map((data) => {
      this.adapter.set(data.ID, data.data)
      console.log(`QuickDB to mzrdb: Copied ${data.ID}`)
    });

    return true;
  },


  get version() {
    return require('../package.json').version;
  },

  get size() {
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
    let dbName = null;
    let dbFolder = null;
    try {
      dbName = this.options ? this.options['dbName'] : 'mzrdb';
      dbFolder = this.options ? this.options['dbFolder'] : 'mzrdb';
    } catch (error) {
      throw new TypeError(this.message['errors']['blankName']);
    }

    if (key === 'all') key = 'all';
    else if (key.includes('word')) key = 'all';
    else if (key.includes('character')) key = 'all';
    else if (key.includes('object')) key = 'object';
    else key = 'all';

    if (dbName && dbFolder) {
      try {
        return this.all(key).length || 0;
      } catch {
        if (error.errno == -4058) throw new Error("mzrdb module is not installed! You can type 'npm i mzrdb@latest' to install it.")
        else throw new Error('An error occurred! Here is the error that occurred: ' + error.message);
      }
    };
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
  }
}