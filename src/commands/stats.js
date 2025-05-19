const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows your game stats'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const db = interaction.client.db;

        const games = [
            { id: 'coinflip', name: '🪙 Coinflip' },
            { id: 'blackjack', name: '🃏 Blackjack' }
        ];
        const statsPerGame = [];

        let totalPlayed = 0;
        let totalWon = 0;
        let totalLost = 0;

        for (const game of games) {
            const stats = await db.getStats(game.id, userId);
            if(!stats) continue;

            const balance = stats.chips_won - stats.chips_lost;
            statsPerGame.push({
                name: `${game.name}`,
                value:
                    `• Games played: **${stats.games_played}**\n` +
                    `• Won: **${stats.chips_won} chips**\n` +
                    `• Lost: **${stats.chips_lost} chips**\n` +
                    `• Balance: **${balance >= 0 ? '+' : ''}${balance} chips**\n`,
                inline: true
            })

            totalPlayed += stats.games_played;
            totalWon += stats.chips_won;
            totalLost += stats.chips_lost;
        }

        while (statsPerGame.length % 3 !== 0) {
            statsPerGame.push({ name: '\u200B', value: '\u200B', inline: true });
        }

        const totalBalance = totalWon - totalLost;
        statsPerGame.push({
            name: '📈 Global',
            value:
                `• Games played: **${totalPlayed}**\n` +
                `• Ganadas: **${totalWon}**\n` +
                `• Perdidas: **${totalLost}**\n` +
                `• Balance: **${totalBalance >= 0 ? '+' : ''}${totalBalance} chips**`,
            inline: false
        })

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${interaction.user.username} stats`)
            .setColor(0xffd324)
            .addFields(statsPerGame)

        return interaction.reply({ embeds: [embed] });
    }
}