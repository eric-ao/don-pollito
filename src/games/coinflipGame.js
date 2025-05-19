const { EmbedBuilder } = require('discord.js');
const EMOJIS = require('../utils/emojis');



async function coinflipGame(interaction) {
    //Check that the bet amount is a valid number
    const bet = parseInt(interaction.fields.getTextInputValue('bet'));
    if (isNaN(bet) || bet <= 0) {
        return interaction.reply({ content: `${EMOJIS.error} Invalid bet.`, ephemeral: true });
    }

    //Check that the user didn't bet more than its chips
    const userChips = await interaction.client.db.getChips(interaction.user.id);
    if(userChips < bet) {
        return interaction.reply({ content: `${EMOJIS.error} You don't have that many chips`, ephemeral: true})
    }

    //Remove chips
    await interaction.client.db.removeChips(interaction.user.id, bet);

    // Lanzar moneda
    const win = Math.random() < 0.5;

    let result = '';
    let color = '';
    if (win) {
        await interaction.client.db.addChips(interaction.client.id, bet * 2);
        await interaction.client.db.registerStats('coinflip', interaction.client.id, bet, 0);
        result = `${EMOJIS.win_huge} You won **${bet * 2} chips**.`;
        color = 'Green';
    } else {
        await interaction.client.db.registerStats('coinflip', interaction.client.id, 0, bet);
        result = `${EMOJIS.lose} You lost **${bet} chips**.`;
        color = 'Red';
    }

    const embed = new EmbedBuilder()
        .setTitle('🪙 Coinflip')
        .setColor(color)
        .setDescription(result)

    return interaction.reply({ embeds: [embed] });
}

module.exports = { coinflipGame };