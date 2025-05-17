const path = require('path')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite');



async function initDatabase() {
    const db = await open({
        filename: path.resolve(__dirname, '../../bot.db'),
        driver: sqlite3.Database
    })

    await db.exec('CREATE TABLE IF NOT EXISTS chips (user_id TEXT PRIMARY KEY, chips INTEGER DEFAULT 0)')


    db.addChips = async (userId, amount) => {
        return db.run(
            'INSERT INTO chips (user_id, chips) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET chips = chips + ?',
            [userId, amount, amount]
        )
    }


    return db;
}

module.exports = { initDatabase };