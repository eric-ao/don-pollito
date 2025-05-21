const { EmbedBuilder } = require('discord.js')
const EMOJIS = require('../utils/emojis');


function weightedRandom(symbols) {
    const total = symbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * total;
    for (const symbol of symbols) {
        if (rand < symbol.weight) return symbol;
        rand -= symbol.weight;
    }
}

async function handleSlotPlay(interaction) {
    const [_, __, costStr, slotId] = interaction.customId.split('_')
    const cost = parseInt(costStr);
    const db = interaction.client.db;
    const userId = interaction.user.id;

    const jackpotWeight = await db.getJackpotWeight(slotId);
    const symbols = [
        { emoji: `${EMOJIS.slot_diamond}`, weight: jackpotWeight, reward: 'jackpot'},
        { emoji: `${EMOJIS.slot_boom}`, weight: 368, reward: 'loseCost'},
        { emoji: `${EMOJIS.slot_lightning}`, weight: 464, reward: 'freeSpin'},
        { emoji: `${EMOJIS.slot_mango}`, weight: 736, reward: ''},
        { emoji: `${EMOJIS.slot_pollito}`, weight: 736, reward: ''},
    ]

    const userChips = await db.getChips(userId);
    if (userChips < cost) {
        return interaction.reply({ content: `${EMOJIS.error} You don't have enough chips`, ephemeral: true})
    }

    await db.removeChips(userId, cost);

    const results = [
        weightedRandom(symbols),
        weightedRandom(symbols),
        weightedRandom(symbols)
    ]

    const placeholders = [EMOJIS.slot_spin, EMOJIS.slot_spin, EMOJIS.slot_spin];

    const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    originalEmbed.setDescription(`Press the button to play.\nCost per game: **${cost} chips**\n\n${placeholders.join(' | ')}`)
    await interaction.update({ embeds: [originalEmbed] })

    for (let i=0; i<3; i++) {
        await new Promise(res => setTimeout(res, 1000));
        placeholders[i] = results[i].emoji;
        originalEmbed.setDescription(`Press the button to play.\nCost per game: **${cost} chips**\n\n${placeholders.join('|')}`)
        await interaction.editReply({ embeds: [originalEmbed] })
    }

    const allEquals = results.every(r => r.emoji === results[0].emoji)

    if (allEquals) {
        switch (results[0].reward) {
            case 'jackpot':
                const jackpot = await db.getJackpot(slotId, cost * 10);
                await db.addChips(userId, jackpot);
                await db.setJackpot(slotId, 0);
                await interaction.followUp({ content: `${EMOJIS.slot_diamond} **JACKPOT!!** You win **${jackpot} chips!** ${EMOJIS.win_huge}`})
                await interaction.client.db.registerStats('slots', interaction.user.id, jackpot-cost, 0);
                await db.setJackpotWeight(slotId, 100);
                break;
            case 'loseCost':
                db.removeChips(userId, cost);
                await interaction.followUp({ content: `${EMOJIS.slot_boom} **BOOM!** You lost **${cost} chips!** ${EMOJIS.slot_boom}`, ephemeral: true})
                await interaction.client.db.registerStats('slots', interaction.user.id, 0, cost*2);
                break;
            case 'freeSpin':
                await db.addChips(userId, cost);
                await interaction.followUp({ content: `${EMOJIS.slot_lightning} **FREE SPIN!** This one is on the house! ${EMOJIS.slot_lightning}`, ephemeral: true})
                await interaction.client.db.registerStats('slots', interaction.user.id, 0, cost);
                break;
            default:
                await interaction.client.db.registerStats('slots', interaction.user.id, 0, cost);
                break;
        }
    } else {
        await interaction.client.db.registerStats('slots', interaction.user.id, 0, cost);
        const current = await db.getJackpot(slotId, cost * 10);
        await db.setJackpot(slotId, current + cost);
        if(jackpotWeight < 311) {
            await db.setJackpotWeight(slotId, jackpotWeight + 1)
        }
    }
}

module.exports = { handleSlotPlay }