const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('motivation')
        .setDescription('Get an extra motivation when losing'),

    async execute(interaction) {
        const imgPath = path.join(__dirname, '../assets/motivation.jpg');
        const file = new AttachmentBuilder(imgPath);

        return interaction.reply({ files: [file] })
    }
}