const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const blackjackEngine = require('./blackjackEngine')
const EMOJIS = require('../utils/emojis')



async function blackjackGame(interaction) {
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

    const game = new blackjackEngine();
    game.dealInitialHands();
    interaction.client.blackjackGames ??= new Map();
    interaction.client.blackjackGames.set(interaction.user.id, { bet, game })

    const playerHandStr = game.handToString(game.playerHand)
    const dealerHandStr = game.handToString(game.dealerHand, true);

    const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack')
        .setDescription(
            `Your bet: **${bet} chips**\n\n` +
            `Your hand: ${playerHandStr} (${game.getHandValue(game.playerHand)})\n` +
            `Dealer: ${dealerHandStr}`)
        .setFooter({ text: 'Choose your action' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`blackjack_hit_${interaction.user.id}`)
            .setLabel('Hit 🃏')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId(`blackjack_stand_${interaction.user.id}`)
            .setLabel('Stand ✋')
            .setStyle(ButtonStyle.Secondary),
    );

    const canDouble = userChips >= bet * 2;
    if(canDouble) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`blackjack_double_${interaction.user.id}`)
                .setLabel('Double 💸')
                .setStyle(ButtonStyle.Success)
        )
    }

    await interaction.reply({ embeds: [embed], components: [buttons] });
}

async function blackjackGameButton(interaction, action) {
    const userGame = interaction.client.blackjackGames?.get(interaction.user.id);
    if (!userGame) {
        return interaction.reply({ content: `${EMOJIS.error} There is no blackjack game active.`, ephemeral: true });
    }

    const game = userGame.game;
    const bet = userGame.bet;
    switch(action) {
        case 'hit':
            return hit(interaction, game, bet);
        case 'stand':
            return stand(interaction, game, bet);
        case 'double':
            return double(interaction, game, bet);
    }
}
async function hit(interaction, game, bet) {
    game.playerHand.push(game.drawCard());
    const playerScore = game.getHandValue(game.playerHand);

    const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack - Hit')
        .setDescription(
            `Your bet: **${bet} chips**\n\n` +
            `Your hand: ${game.handToString(game.playerHand)} (${playerScore})\n`  +
            `Dealer: ${game.handToString(game.dealerHand, true)}`)

    if (playerScore > 21) {
        interaction.client.blackjackGames.delete(interaction.user.id);
        embed.setColor('Red').setFooter({ text: `${EMOJIS.lose} You went over 21. You lost ${bet} chips.` })
        await interaction.client.db.registerStats('blackjack', interaction.client.id, 0, bet);
        await interaction.update({ embeds: [embed], components: []})
    } else {
        const updatedButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`blackjack_hit_${interaction.user.id}`)
                .setLabel('Pedir Carta 🃏')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`blackjack_stand_${interaction.user.id}`)
                .setLabel('Plantarse ✋')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [updatedButtons] });
    }
}
async function stand(interaction, game, bet) {
    //Dealer plays
    while (game.getHandValue(game.dealerHand) < 17) {
        game.dealerHand.push(game.drawCard());
    }

    const playerScore = game.getHandValue(game.playerHand);
    const dealerScore = game.getHandValue(game.dealerHand);

    let result = '';
    let color = '';

    if (playerScore > 21) {
        result = `${EMOJIS.lose} You went over 21. You lost ${bet} chips.`;
        color = 'Red';
        await interaction.client.db.registerStats('blackjack', interaction.client.id, 0, bet);
    }
    else if (dealerScore > 21 || playerScore > dealerScore) {
        result = `${EMOJIS.win_huge} You won **${bet} chips**!`;
        color = 'Green';
        await interaction.client.db.addChips(interaction.user.id, bet * 2);
        await interaction.client.db.registerStats('blackjack', interaction.client.id, bet, 0);
    } else if (dealerScore === playerScore) {
        result =  `${EMOJIS.draw} Draw. You recover your chips.`;
        color = 'Yellow'
        await interaction.client.db.addChips(interaction.user.id, bet);
        await interaction.client.db.registerStats('blackjack', interaction.client.id, 0, 0);
    } else {
        result = `${EMOJIS.lose} You lost **${bet} chips**.`;
        color = 'Red';
        await interaction.client.db.registerStats('blackjack', interaction.client.id, 0, bet);
    }

    interaction.client.blackjackGames.delete(interaction.user.id);

    const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack - Stand')
        .setDescription(
            `Your bet: **${bet} chips**\n\n` +
            `Your hand: ${game.handToString(game.playerHand)} (${playerScore})\n` +
            `Dealer: ${game.handToString(game.dealerHand)} (${dealerScore})\n\n` +
            result
        )
        .setColor(color);

    await interaction.update({ embeds: [embed], components: [] });
}
async function double(interaction, game, bet) {
    const userChips = await interaction.client.db.getChips(interaction.user.id);

    if(userChips < bet) {
        return interaction.reply({ content: `${EMOJIS.error} Not enough chips to double.`, ephemeral: true })
    }

    const userGame = interaction.client.blackjackGames.get(interaction.user.id);
    userGame.bet *= 2;
    await interaction.client.db.removeChips(interaction.user.id, bet);

    game.playerHand.push(game.drawCard());
    return stand(interaction, game, userGame.bet);
}


module.exports = { blackjackGame, blackjackGameButton };