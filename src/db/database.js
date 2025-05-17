const path = require('path')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite');



async function initDatabase() {
    const db = await open({
        filename: path.resolve(__dirname, '../../bot.db'),
        driver: sqlite3.Database
    })

    await db.exec('CREATE TABLE IF NOT EXISTS chips (user_id TEXT PRIMARY KEY, chips INTEGER DEFAULT 0)')

    return db;
}

module.exports = initDatabase;