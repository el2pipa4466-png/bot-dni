const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./dni.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS dni (
        userId TEXT PRIMARY KEY,
        nombre TEXT,
        apellidos TEXT,
        nacionalidad TEXT,
        nacimiento INTEGER,
        sexo TEXT,
        dniNumero TEXT
    )`);
});

module.exports = db;
