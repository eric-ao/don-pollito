const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('chips').setDescription('Get your chips amount'),

    async execute(interaction) {

        const db = interaction.client.db;
        const userId = interaction.user.id;

        let userData = await db.get('SELECT * FROM chips WHERE user_id = ?', [userId])
        if(!userData) {
            await db.run('INSERT INTO chips (user_id, chips) VALUES (?, ?)', [userId, 0]);
            userData = { user_id: userId, chips: 0};
        }

        return await interaction.reply(`💰 You have ${userData.chips} chips.`)
    }
}