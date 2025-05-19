const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('coinflip').setDescription('Bet an amount of chips and flip a coin'),

    async execute(interaction) {
        const chipsAmount = await interaction.client.db.getChips(interaction.user.id);

        const modal = new ModalBuilder()
            .setCustomId(`coinflip_modal_${interaction.user.id}`)
            .setTitle('🎰 Choose your bet')

        const betInput = new TextInputBuilder()
            .setCustomId('bet')
            .setLabel(`You have ${chipsAmount} chips`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};