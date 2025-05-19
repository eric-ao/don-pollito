const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('blackjack').setDescription('Start a blackjack game with your chips'),

    async execute(interaction) {
        const chipsAmount = await interaction.client.db.getChips(interaction.user.id);

        const modal = new ModalBuilder()
            .setCustomId(`blackjack_modal_${interaction.user.id}`)
            .setTitle('🎰 Choose your bet')

        const input = new TextInputBuilder()
            .setCustomId('bet')
            .setLabel(`You have ${chipsAmount} chips`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
}