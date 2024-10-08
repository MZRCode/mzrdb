module.exports.set = function (path, value, obj, seperator) {
  var schema = obj;
  var pList = path.split(seperator);
  var len = pList.length;

  for (var i = 0; i < len - 1; i++) {
    var elem = pList[`${i}`];
    if (typeof schema[`${elem}`] !== 'object') schema[`${elem}`] = {};

    schema = schema[`${elem}`];
  }

  schema[pList[`${len - 1}`]] = value;
};

module.exports.get = function (obj, seperator, ...data) {
  return data.reduce(function (acc, key) {
    return acc[`${key}`];
  }, obj);
};

module.exports.remove = function (obj, path, seperator) {
  if (!obj || !path) return;
  if (typeof path === 'string') path = path.split(seperator);

  for (var i = 0; i < path.length - 1; i++) {
    obj = obj[path[`${i}`]];

    if (typeof obj === 'undefined') return;
  }

  delete obj[path.pop()];
};

module.exports.fetchFiles = function (dbFolder, dbName) {
  const fs = require('fs');

  if (fs.existsSync(`${dbFolder}`) === false) {
    fs.mkdirSync(`${dbFolder}`);

    if (fs.existsSync(`./${dbFolder}/${dbName}.yaml`) === false) {
      fs.writeFileSync(`./${dbFolder}/${dbName}.yaml`, '{}');

      return;
    };
  } else if (fs.existsSync(`./${dbFolder}/${dbName}.yaml`) === false) {
    fs.writeFileSync(`./${dbFolder}/${dbName}.yaml`, '{}');
  };
}