<div align='center'>
<p>
   <a href='https://nodei.co/npm/mzrdb/'><img src='https://nodei.co/npm/mzrdb.png?downloads=true&stars=true' alt='NPM info' /></a>
</p>
<p>
    <a href='https://www.npmjs.com/package/mzrdb'><img src='https://img.shields.io/npm/dt/mzrdb.svg?style=for-the-badge' alt='Download' /></a>
    <a href='https://www.npmjs.com/package/mzrdb'><img src='https://img.shields.io/npm/dm/mzrdb.svg?style=for-the-badge' alt='Download' /></a>
    <a href='https://www.npmjs.com/package/mzrdb'><img src='https://img.shields.io/npm/dw/mzrdb.svg?style=for-the-badge' alt='Download' /></a>
</p>
<p>
    <a href='https://www.npmjs.com/package/mzrdb'><img src='https://img.shields.io/npm/l/mzrdb.svg?style=for-the-badge' alt='License' /></a>
    <a href='https://discord.gg/ktVdQYrtXF' target='_blank'> <img alt='Discord' src='https://img.shields.io/badge/Support-Click%20here-7289d9?style=for-the-badge&logo=discord'> </a>
    <a href='https://www.npmjs.com/package/mzrdb'><img src='https://img.shields.io/npm/v/mzrdb.svg?style=for-the-badge' alt='License' /></a>
</p>
<p>
    <a href="https://www.buymeacoffee.com/mzrdev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="120px" height="30px" alt="Buy Me A Coffee"></a>
</p>
</div>

## Update
- loadBackup function added!
- **MongoDB support has been added.**
- TypeScript definitions of all functions have been changed!
- Added examples and explanations to all functions
![ExampleSS](https://cdn.discordapp.com/attachments/1141839057933049958/1216027995911884830/image.png?ex=65fee552&is=65ec7052&hm=ebd1c25b7adc3fb0bd4e4090f30b271d00b0756a3b6f59dc2a5bf72bbee617eb&)

## About
- **Designed for Beginners:** The mzrdb module simplifies working with databases for new programmers. It provides an intuitive key-value interface, making data storage and retrieval a breeze.
- **Built on Proven Technologies:** mzrdb leverages established database tools like  Mongoose, Json, Yaml and Bson. This ensures compatibility and a familiar experience for developers.
- **Future-Proof Flexibility:** The mzrdb module is designed with expandability in mind. Support for additional database types is planned for future releases, offering even greater flexibility.

## Features
- Beginner-friendly
- All-inclusive
- Easy to use
- Customizable separators
- Key-value methods
- Quick response times
- Seamless database switching

## Benefits
- Streamlined development process
- Optimal performance and efficiency
- Ultimate flexibility
- Open-source and actively maintained
- Extensive documentation and tutorials
- Reliable and robust solutio

## Moving Data From Quick.DB to mzrdb (Local Database)
```js
const db = require('mzrdb');
const quickdb = require('quick.db');

db.move(quickdb);
```

## Moving Data From mzrdb to MongoDB
```js
db.setAdapter('mongodb', { url: 'yourMongoURL' });
const jsondb = require('../yourFile.json');

db.moveToMongo(jsondb);
```

## All Mongo Adapter Methods
```js
const db = require('mzrdb')

db.setLanguage('en') // en
db.setCheckUpdates(true) // true
db.setAdapter('jsondb') // true
db.setFolder('mzrdb') // true
db.setFile('mzrdb') // true

await db.set('key.mzr', 'value') // key: { mzr: "value" }
await db.set('key', 'value') // key: "value"

await db.add('key2', 1) // 1
await db.sub('key2', 1) // 0
await db.subtract('key2', 1) // 0

await db.get('key') // "value"
await db.fetch('key') // "value"

await db.all() // { key: "value" }
await db.getAll() // { key: "value" }
await db.fetchAll() // { key: "value" }

await db.all('object') // [[ "key", [ "value" ]] ]
await db.all('keys') // [ "key" ]
await db.all('values') // [ [ "value" ] ]

await db.push('key', 'value') // key: ["value"]
await db.push('key', 'mzr') // key: ["value", "mzr"]
await db.unpush('key', 'value') // ["mzr"]

await db.push('key', { mzr: 'value' }) // [{ mzr: "value" }]
await db.push('key', { mzr2: 'value2' }) // [{ mzr: "value" }, { mzr2: "value2" } ]

await db.delByPriority('key', 1) // [ { mzr2: "value2" } ]
await db.setByPriority('key', { new2: 'This Edited!' }, 1) // [ { new2: "This Edited!" } ]

await db.type('key') // string
await db.has('key') // true
await db.check('key') // true

await db.del('key') // true
await db.delete('key') // true

await db.deleteAll() // true (Cleans database)
await db.clear() // true (Cleans database)

await db.backup('fileName') // true (Backups database)
await db.destroy() // true (Deletes database file)

await db.uptime() // 30000 (Milliseconds)

await db.connecetion() // true
await db.disconnect() // true
await db.deleteMongo() // true

await db.exports('fileName') // true (Highly advanced)
await db.export('fileName') // true (Highly advanced)

await db.length() // 20 (Character count)

db.ping // { read: '1ms', write: '3ms', average: '2ms' }
db.size // 11 Bytes (Database size)
db.version // 1.0.0 (Module version)
```

## All Local Adapter Methods
```js
const db = require('mzrdb')

db.setLanguage('en') // en
db.setReadable(false) // false
db.setNoBlankData(false) // false
db.setCheckUpdates(true) // true
db.setAdapter('jsondb') // true
db.setFolder('mzrdb') // true
db.setFile('mzrdb') // true

db.set('key.mzr', 'value') // key: { mzr: "value" }
db.set('key', 'value') // key: "value"

db.add('key2', 1) // 1
db.sub('key2', 1) // 0
db.subtract('key2', 1) // 0

db.get('key') // "value"
db.fetch('key') // "value"

db.all() // { key: "value" }
db.getAll() // { key: "value" }
db.fetchAll() // { key: "value" }

db.all('object') // [[ "key", [ "value" ]] ]
db.all('keys') // [ "key" ]
db.all('values') // [ [ "value" ] ]

db.push('key', 'value') // key: ["value"]
db.push('key', 'mzr') // key: ["value", "mzr"]
db.unpush('key', 'value') // ["mzr"]

db.push('key', { mzr: 'value' }) // [{ mzr: "value" }]
db.push('key', { mzr2: 'value2' }) // [{ mzr: "value" }, { mzr2: "value2" } ]

db.delByPriority('key', 1) // [ { mzr2: "value2" } ]
db.setByPriority('key', { new2: 'This Edited!' }, 1) // [ { new2: "This Edited!" } ]

db.type('key') // string
db.has('key') // true
db.check('key') // true

db.del('key') // true
db.delete('key') // true

db.deleteAll() // true (Cleans database)
db.clear() // true (Cleans database)

db.backup('fileName') // true (Backups database)
db.loadBackup('./mzrdb-backup') // true
db.destroy() // true (Deletes database file)

db.startsWith('ke') // [ { key: "key", data: "value" } ]
db.includes('e') // [ { key: "key", data: "value" } ]
db.endsWith('ey') // [ { key: "key", data: "value" } ]

db.length('object') // 1 
db.length() // 20 (Character count)

db.ping // { read: '1ms', write: '3ms', average: '2ms' }
db.size // 11 Bytes (Database size)
db.version // 1.0.0 (Module version)
```

## Contact & Support
[![Discord Server](https://api.weblutions.com/discord/invite/ktVdQYrtXF)](https://discord.gg/ktVdQYrtXF)
