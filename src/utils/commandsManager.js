const fs = require('node:fs');
const path = require('node:path');


module.exports = function registerCommands(client) {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {

            client.commands.set(command.data.name, command);

        } else {
            console.warn(`Command in ${filePath} has bad definition`);
        }
    }
}