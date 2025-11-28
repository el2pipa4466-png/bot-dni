// ───────────────────────────────────────────────────────────
//       BOT AUTÓNOMO 24/7 (auto-reconexión y auto-reinicio)
// ───────────────────────────────────────────────────────────

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const db = require("./database");
const { consejoRoleId } = require("./config.json");

// Usa variable de entorno o token directo si lo prefieres
const TOKEN = process.env.TOKEN || require("./config.json").token;

// Crear cliente con reconexión reforzada
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    retryLimit: 999999 // reintentos infinitos
});

// ─────────────────────────────────────────────
// 1. MANEJO DE ERRORES (no deja que el bot muera)
// ─────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
    console.log("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.log("❌ Uncaught Exception:", err);
});

// ─────────────────────────────────────────────
// 2. KEEP ALIVE interno (mantener proceso activo)
// ─────────────────────────────────────────────
setInterval(() => {
    console.log("💓 Bot activo:", new Date().toLocaleString());
}, 60000); // cada minuto

// ─────────────────────────────────────────────
// 3. AUTO RE-CONEXIÓN si el bot se desconecta
// ─────────────────────────────────────────────
client.on("disconnect", () => {
    console.log("⚠️ Desconectado. Reintentando login...");
    client.login(TOKEN);
});

setInterval(() => {
    if (!client.isReady()) {
        console.log("⚠️ Cliente no listo, reintentando login...");
        client.login(TOKEN);
    }
}, 10000);

// ─────────────────────────────────────────────
// 4. FUNCIÓN PARA CREAR EL EMBED DEL DNI
// ─────────────────────────────────────────────
function crearEmbedDNI(data, user) {
    return new EmbedBuilder()
        .setTitle("GOBIERNO DE ATLANTIS")
        .setDescription(`
**Nombre:** ${data.nombre}
**Apellidos:** ${data.apellidos}
**Nacionalidad:** ${data.nacionalidad}
**Año de nacimiento:** ${data.nacimiento}
**Sexo:** ${data.sexo}

**Número de DNI:** ${data.dniNumero}
        `)
        .setColor("Blue")
        .setFooter({ text: `Propietario: ${user.tag}` })
        .setTimestamp();
}

// ─────────────────────────────────────────────
//  FUNCIÓN PARA GENERAR NÚMERO DE DNI
// ─────────────────────────────────────────────
function generarNumeroDNI() {
    return Math.floor(Math.random() * 90000000 + 10000000).toString();
}

// ─────────────────────────────────────────────
// 5. COMANDOS
// ─────────────────────────────────────────────

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;

    // ──────────── /dni-crear ────────────
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
                dniNumero: generarNumeroDNI(),
            };

            db.run(
                "INSERT INTO dni (userId, nombre, apellidos, nacionalidad, nacimiento, sexo, dniNumero) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    userId,
                    data.nombre,
                    data.apellidos,
                    data.nacionalidad,
                    data.nacimiento,
                    data.sexo,
                    data.dniNumero,
                ]
            );

            const embed = crearEmbedDNI(data, interaction.user);

            interaction.reply({
                content: "📄 DNI creado con éxito.",
                ephemeral: true
            });

            const canal = interaction.guild.channels.cache.find((c) =>
                c.name.toLowerCase().includes("dni")
            );

            if (canal) canal.send({ content: `<@${userId}>`, embeds: [embed] });
        });
    }

    // ──────────── /dni-ver ────────────
    if (interaction.commandName === "dni-ver") {
        db.get("SELECT * FROM dni WHERE userId = ?", [userId], (err, row) => {
            if (!row)
                return interaction.reply({
                    content: "❌ No tienes un DNI creado.",
                    ephemeral: true
                });

            const embed = crearEmbedDNI(row, interaction.user);
            interaction.reply({ embeds: [embed] });
        });
    }

    // ──────────── /dni-tirar ────────────
    if (interaction.commandName === "dni-tirar") {
        db.run("DELETE FROM dni WHERE userId = ?", [userId]);
        interaction.reply("🗑️ Tu DNI ha sido borrado.");
    }

    // ──────────── /dni_revisar ────────────
    if (interaction.commandName === "dni_revisar") {
        const usuario = interaction.options.getUser("usuario");

        const admin = interaction.member;
        if (!admin.roles.cache.has(consejoRoleId)) {
            return interaction.reply({
                content: "❌ No tienes permiso para usar este comando.",
                ephemeral: true
            });
        }

        db.get("SELECT * FROM dni WHERE userId = ?", [usuario.id], (err, row) => {
            if (!row)
                return interaction.reply({
                    content: "❌ Ese usuario no tiene DNI.",
                    ephemeral: true
                });

            const embed = crearEmbedDNI(row, usuario);
            interaction.reply({
                content: `DNI del usuario: ${usuario.tag}`,
                embeds: [embed],
                ephemeral: true
            });
        });
    }
});

// ─────────────────────────────────────────────
// 6. LOGIN DEL BOT
// ─────────────────────────────────────────────
client.login(TOKEN);

console.log("🚀 Bot iniciándose...");
