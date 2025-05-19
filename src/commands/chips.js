const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const EMOJIS = require('../utils/emojis')

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

        const embed = new EmbedBuilder()
            .setColor(0x747475) // gris oscuro (tono de embeds neutrales de Discord)
            .setDescription(`You have **${userData.chips} chips** ${EMOJIS.chips}`)

        return await interaction.reply({ embeds: [embed] });
    }
}