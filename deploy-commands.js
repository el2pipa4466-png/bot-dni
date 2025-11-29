// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

module.exports = async function (guildId, clientId, token) {
    
    const commands = [
        new SlashCommandBuilder()
            .setName("dni-crear")
            .setDescription("Crear un nuevo DNI")
            .addStringOption(opt => opt.setName("nombre").setDescription("Nombre").setRequired(true))
            .addStringOption(opt => opt.setName("apellidos").setDescription("Apellidos").setRequired(true))
            .addStringOption(opt => opt.setName("nacionalidad").setDescription("Nacionalidad").setRequired(true))
            .addIntegerOption(opt => opt.setName("nacimiento").setDescription("Año de nacimiento").setRequired(true))
            .addStringOption(opt => opt.setName("sexo").setDescription("Sexo").setRequired(true)),

        new SlashCommandBuilder()
            .setName("dni-ver")
            .setDescription("Ver tu DNI"),

        new SlashCommandBuilder()
            .setName("dni-tirar")
            .setDescription("Eliminar tu DNI"),

        new SlashCommandBuilder()
            .setName("dni_revisar")
            .setDescription("Revisar DNI de un usuario (solo consejo)")
            .addUserOption(opt => opt.setName("usuario").setDescription("Usuario").setRequired(true))
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
        console.error("❌ Error registrando comandos:", error);
    }
};
