const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('chips').setDescription('Get your chips amount'),
    async execute(interaction) {
        await interaction.reply('None')
    }
}