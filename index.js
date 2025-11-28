const { Client, GatewayIntentBits } = require("discord.js");
const deployCommands = require("./deploy-commands");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const consejoRoleId = process.env.CONSEJO_ROLE_ID;
const clientId = process.env.CLIENT_ID;

client.once("ready", () => {
    console.log(`🚀 Bot iniciado como ${client.user.tag}`);
    deployCommands(guildId, clientId, token);
});

client.login(token);
