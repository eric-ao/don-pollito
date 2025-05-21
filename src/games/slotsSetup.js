const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const EMOJIS = require('../utils/emojis');

async function slotsSetupHandler(interaction) {
    const userId = interaction.customId.split('_').at(-1);
    const rawCost = interaction.fields.getTextInputValue('slot_cost');
    const cost = parseInt(rawCost);

    if (isNaN(cost) || cost <= 0) {
        return interaction.reply({ content: `${EMOJIS.error} Invalid cost.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🎰 Slot machine')
        .setDescription(`Press the button to play.\nCost per game: **${cost} chips**`)
        .setColor(0xffd324)

    const slotId = `${interaction.guild.id}${Math.random()}`
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`slot_play_${cost}_${slotId}`)
            .setLabel('Play')
            .setStyle(ButtonStyle.Secondary)
    );

    await interaction.client.db.getJackpot(slotId, cost * 10);
    await interaction.reply({ embeds: [embed], components: [row] });
}

module.exports = { slotsSetupHandler };