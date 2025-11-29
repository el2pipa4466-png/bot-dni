// index.js
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const deployCommands = require("./deploy-commands");
const db = require("./database");

// Variables ENV (Render)
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CONSEJO_ROLE_ID = process.env.CONSEJO_ROLE_ID;

// Cliente Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// DEBUG básico
console.log("DEBUG Env Vars:", {
    TOKEN: !!TOKEN,
    GUILD_ID: !!GUILD_ID,
    CLIENT_ID: !!CLIENT_ID,
    CONSEJO_ROLE_ID: !!CONSEJO_ROLE_ID
});

// Al iniciar
client.once("ready", async () => {
    console.log(`🚀 Bot iniciado como ${client.user.tag}`);

    // Registrar comandos
    await deployCommands(GUILD_ID, CLIENT_ID, TOKEN);

    console.log("📌 Bot y comandos listos.");
});

// Función embed DNI
function crearEmbedDNI(data, user) {
    return new EmbedBuilder()
        .setTitle("GOBIERNO DE ATLANTIS")
        .setDescription(
            `**Nombre:** ${data.nombre}
**Apellidos:** ${data.apellidos}
**Nacionalidad:** ${data.nacionalidad}
**Año de nacimiento:** ${data.nacimiento}
**Sexo:** ${data.sexo}
**Número de DNI:** ${data.dniNumero}`
        )
        .setColor("Blue")
        .setFooter({ text: `Propietario: ${user.tag}` })
        .setTimestamp();
}

// Generador DNI
function generarNumeroDNI() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Comandos
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;

    // /dni-crear
    if (interaction.commandName === "dni-crear") {
        db.get("SELECT * FROM dni WHERE userId = ?", [userId], (err, row) => {

            if (row)
                return interaction.reply({
                    content: "❌ Ya tienes un DNI creado.",
                    ephemeral: true
                });

            const data = {
                nombre: interaction.options.getString("nombre"),
                apellidos: interaction.options.getString("apellidos"),
                nacionalidad: interaction.options.getString("nacionalidad"),
                nacimiento: interaction.options.getInteger("nacimiento"),
                sexo: interaction.options.getString("sexo"),
                dniNumero: generarNumeroDNI()
            };

            db.run(
                "INSERT INTO dni (userId, nombre, apellidos, nacionalidad, nacimiento, sexo, dniNumero) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [userId, data.nombre, data.apellidos, data.nacionalidad, data.nacimiento, data.sexo, data.dniNumero]
            );

            const embed = crearEmbedDNI(data, interaction.user);

            interaction.reply({
                content: "📄 DNI creado con éxito.",
                ephemeral: true
            });

            const canal = interaction.guild.channels.cache.find(c => c.name.toLowerCase().includes("dni"));
            if (canal) canal.send({ content: `<@${userId}>`, embeds: [embed] });
        });
    }

    // /dni-ver
    if (interaction.commandName === "dni-ver") {
        db.get("SELECT * FROM dni WHERE userId = ?", [userId], (err, row) => {

            if (!row)
                return interaction.reply({
                    content: "❌ No tienes un DNI creado.",
                    ephemeral: true
                });

            interaction.reply({ embeds: [crearEmbedDNI(row, interaction.user)] });
        });
    }

    // /dni-tirar
    if (interaction.commandName === "dni-tirar") {
        db.run("DELETE FROM dni WHERE userId = ?", [userId]);
        interaction.reply("🗑️ Tu DNI ha sido borrado.");
    }

    // /dni_revisar
    if (interaction.commandName === "dni_revisar") {

        if (!interaction.member.roles.cache.has(CONSEJO_ROLE_ID))
            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });

        const usuario = interaction.options.getUser("usuario");

        db.get("SELECT * FROM dni WHERE userId = ?", [usuario.id], (err, row) => {
            if (!row)
                return interaction.reply({
                    content: "❌ Ese usuario no tiene DNI.",
                    ephemeral: true
                });

            interaction.reply({
                content: `DNI del usuario ${usuario.tag}`,
                embeds: [crearEmbedDNI(row, usuario)],
                ephemeral: true
            });
        });
    }
});

// Login definitivo
client.login(TOKEN);

