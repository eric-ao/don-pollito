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

    db.getChips = async (userId) => {
        const result = await db.get('SELECT chips FROM chips WHERE user_id = ?', [userId]);

        if (!result) {
            await db.run('INSERT INTO chips (user_id, chips) VALUES (?, 0)', [userId]);
            return 0;
        }

        return result.chips;
    }

    db.removeChips = async (userId, amount) => {
        return db.run(
            'UPDATE chips SET chips = chips - ? WHERE user_id = ?',
            [amount, userId]
        )
    }


    return db;
}

module.exports = { initDatabase };