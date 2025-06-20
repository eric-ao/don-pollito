const path = require('path')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite');



async function initDatabase() {
    const db = await open({
        filename: path.resolve(__dirname, '../../bot.db'),
        driver: sqlite3.Database
    })

    await db.exec('CREATE TABLE IF NOT EXISTS chips (user_id TEXT PRIMARY KEY, chips INTEGER DEFAULT 0)')
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blackjack_stats (
          user_id TEXT PRIMARY KEY,
          games_played INTEGER DEFAULT 0,
          chips_won INTEGER DEFAULT 0,
          chips_lost INTEGER DEFAULT 0
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS coinflip_stats (
          user_id TEXT PRIMARY KEY,
          games_played INTEGER DEFAULT 0,
          chips_won INTEGER DEFAULT 0,
          chips_lost INTEGER DEFAULT 0
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS slots_stats (
            user_id TEXT PRIMARY KEY,
            games_played INTEGER DEFAULT 0,
            chips_won INTEGER DEFAULT 0,
            chips_lost INTEGER DEFAULT 0
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS slots_machines  (
            id TEXT PRIMARY KEY,
            jackpot INTEGER NOT NULL,
            jackpot_weight INTEGER DEFAULT 100
        );
    `)


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

    db.registerStats = async (game, userId, won, lost) => {
        const table = `${game}_stats`;

        await db.run(`
            INSERT INTO ${table} (user_id, games_played, chips_won, chips_lost)
            VALUES (?, 1, ?, ?)
            ON CONFLICT(user_id)
            DO UPDATE SET
              games_played = games_played + 1,
              chips_won = chips_won + ?,
              chips_lost = chips_lost + ?
            `, [userId, won, lost, won, lost]);
    }

    db.getStats = async (game, userId) => {
        return db.get(`SELECT * FROM ${game}_stats WHERE user_id = ?`, [userId])
    }

    db.getJackpot = async (slotId, initialValue) => {
        const row = await db.get('SELECT jackpot FROM slots_machines WHERE id = ?', [slotId]);
        if (row) return parseInt(row.jackpot);

        await db.run('INSERT INTO slots_machines (id, jackpot) VALUES (?, ?)', [slotId, initialValue]);
        return initialValue;
    }

    db.setJackpot = async (slotId, value) => {
        await db.run('UPDATE slots_machines SET jackpot = ? WHERE id = ?', [value, slotId]);
    }

    db.getJackpotWeight = async (slotId) => {
        const row = await db.get('SELECT jackpot_weight FROM slots_machines WHERE id = ?', [slotId]);
        return row ? parseInt(row.jackpot_weight) : 1;
    }

    db.setJackpotWeight = async (slotId, weight) => {
        await db.run('UPDATE slots_machines SET jackpot_weight = ? WHERE id = ?', [weight, slotId])
    }


    return db;
}

module.exports = { initDatabase };