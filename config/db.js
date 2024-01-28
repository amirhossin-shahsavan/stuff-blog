const Config = require("./config.json");

module.exports = {
  URL:
    Config.db.auth == true
      ? `mongodb://${Config.db.username}:${Config.db.password}@${Config.db.url}:${Config.db.port}/${Config.db.dbname}?authSource=${Config.db.dbauth}`
      : `mongodb://${Config.db.url}:${Config.db.port}/${Config.db.dbname}`,
};
