const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowbuilder, ActionRowBuilder} = require('discord.js')
const EMOJIS = require('../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Creates a persistent slots machine'),

    async execute(interaction) {
        const roleName = "Don Pollito's crupier"
        const guild = interaction.guild;

        let role = guild.roles.cache.find(r => r.name === roleName);
        if(!role) {
            role = await guild.roles.create({
                name: roleName,
                reason: "Needed role for this command"
            })
        }

        if (!interaction.member.roles.cache.has(role.id)) {
            return interaction.reply({
                content: `${EMOJIS.error} You need the "${roleName}" role to do this`,
                ephemeral: true
            })
        }

        const modal = new ModalBuilder()
            .setCustomId(`slots_config_modal_${interaction.user.id}`)
            .setTitle(`🎰 Slots config`)

        const costInput = new TextInputBuilder()
            .setCustomId('slot_cost')
            .setLabel('Chips per game')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(costInput));

        await interaction.showModal(modal);
    }
}