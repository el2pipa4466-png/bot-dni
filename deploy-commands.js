// deploy-commands.js
// Este script registra los slash commands de tu bot en tu servidor

const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const { token, guildId } = require("./config.json");

// Pega aquí tu Client ID (Application ID)
const clientId = "1444036060874145872";

// Define tus comandos
const commands = [
  new SlashCommandBuilder()
    .setName("dni-crear")
    .setDescription("Crear un DNI")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("apellidos")
        .setDescription("Apellidos")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("nacionalidad")
        .setDescription("Nacionalidad")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("nacimiento")
        .setDescription("Año de nacimiento")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("sexo")
        .setDescription("Sexo")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("dni-ver")
    .setDescription("Ver tu DNI"),

  new SlashCommandBuilder()
    .setName("dni-tirar")
    .setDescription("Eliminar tu DNI"),

  new SlashCommandBuilder()
    .setName("dni_revisar")
    .setDescription("Revisar el DNI de un usuario (solo EL CONSEJO)")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario a revisar")
        .setRequired(true))
].map(command => command.toJSON());

// Crear instancia REST y registrar comandos
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🔹 Registrando comandos...");
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log("✅ Comandos registrados correctamente.");
  } catch (error) {
    console.error(error);
  }
})();
