require('dotenv').config({ path: __dirname + '/../.env' });

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const registerCommands = require('./utils/commandsManager');
const { initDatabase } = require('./db/database')
const { blackjackGame, blackjackGameButton } = require('./games/blackjackGame')



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})
client.commands = new Collection();
registerCommands(client);


(async () => {
    client.db = await initDatabase();
    console.log("✅ Database ready");
})();


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit()) {
        //Player is betting on a game
        if(interaction.customId.startsWith('blackjack_modal_')) {
            return blackjackGame(interaction);
        }

    } else if (interaction.isButton()) {
        //Check that the user that started the game has clicked the button
        const [prefix, action, userId] = interaction.customId.split('_');
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: "❌ You cannot play someone else's game.", ephemeral: true });
        }


        if(prefix === 'blackjack') {
            blackjackGameButton(interaction, action);
        }

    } else {
        //Probably a command
        if(!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if(!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Error trying to execute the command.', ephemeral: true });
            } else {
                await interaction.followUp({ content: '❌ Internal error.', ephemeral: true });
            }
        }
    }
})

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    try {
        client.db.addChips(message.author.id, 1);
    } catch (err) {
        console.error(`❌ Error trying to give chips to ${message.author.id}:`, err)
    }
})

client.once('ready', () => {
    console.log(`🤖 Bot connected as ${client.user.tag}`)

    setInterval(async () => {

        for (const [guildId, guild] of client.guilds.cache) {
            for (const [, channel] of guild.channels.cache) {
                if (channel.type === 2) {

                    const members = channel.members.filter(m => !m.user.bot);
                    const count = members.size;

                    if (count > 0) {
                        for (const [id] of members) {
                            const chips = 10 * (1 + (count-1) / 10);

                            try {
                                await client.db.addChips(id, chips);
                            } catch (err) {
                                console.error(`❌ Error trying to give chips to ${id}:`, err)
                            }
                        }
                    }
                }
            }
        }

    }, 60_000);
})

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('✅ Logged in successfully'))
    .catch(err => console.error('❌ Error trying to log in.', err))