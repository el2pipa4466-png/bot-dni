const { REST, Routes, SlashCommandBuilder } = require("discord.js");

module.exports = async function(guildId, clientId, token) {
    const commands = [
        new SlashCommandBuilder().setName("dni-crear").setDescription("Crear un nuevo DNI"),
        new SlashCommandBuilder().setName("dni-ver").setDescription("Ver tu DNI"),
        new SlashCommandBuilder().setName("dni-tirar").setDescription("Eliminar tu DNI"),
        new SlashCommandBuilder().setName("dni_revisar").setDescription("Revisar DNI (solo EL CONSEJO)")
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log("🔹 Registrando comandos...");
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log("✅ Comandos registrados correctamente");
    } catch (error) {
        console.error(error);
    }
};
