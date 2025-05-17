require('dotenv').config({ path: __dirname + '/../.env' });

const{ REST, Routes } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')



const commands = [];
const commandsPath = path.join(__dirname, '../src/commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`Command in ${filePath} has bad definition`)
    }
}

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔄 Resetting bot commands...')

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }
        );

        console.log('✅ Bot commands resetted.');
    } catch (err) {
        console.error('❌ Error trying to reset bot commands: ', err);
    }
})();