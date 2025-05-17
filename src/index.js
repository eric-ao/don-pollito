require('dotenv').config({ path: __dirname + '/../.env' });

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const registerCommands = require('./utils/commandsManager');



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



client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Error trying to execute the command.', ephemeral: true });
    }
})

client.once('ready', () => {
    console.log(`🤖 Bot connected as ${client.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('✅ Logged in successfully'))
    .catch(err => console.error('❌ Error trying to log in.', err))