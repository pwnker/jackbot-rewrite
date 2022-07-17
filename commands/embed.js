const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription(
            "Create a fancy embedded message. Either JSON or slash command options can be used, not both."
        )
        .addStringOption((option) =>
            option.setName("title").setDescription("The embed title.")
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("The main body of the embed.")
        )
        .addStringOption((option) =>
            option
                .setName("color")
                .setDescription("The color of the embed.")
        )
        .addStringOption((option) =>
            option
                .setName("footer")
                .setDescription("The footer of the embed.")
        )
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setDescription("The image to be embedded")
        )
        .addAttachmentOption((option) =>
            option
                .setName("small-image")
                .setDescription("The small image to be embedded")
        )
        .addBooleanOption((option) =>
            option
                .setName("timestamp")
                .setDescription("Wether to add a timestamp to the footer")
        )
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("The url to go to when the title of the embed is clicked.")
        )
        .addAttachmentOption((option) =>
            option
                .setName("avatar")
                .setDescription("The avatar of the webhook that sends the embed.")
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("The username of the webhook that sends the embed.")
        )
        .addStringOption((option) =>
            option
                .setName("json")
                .setDescription(
                    "Send up to 10 messages from JSON as described here: http://0xja.cc/webhooks."
                )
        )
        .addStringOption((option) =>
            option
                .setName("fields")
                .setDescription(
                    'Add fields separated by commas (and spaces) in the format `name:value`.'
                )
        )
        .addBooleanOption((option) =>
            option
                .setName("inline-fields")
                .setDescription("Wether to display fields inline")
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const modRole = await interaction.client.db.settings.findOne({
            attributes: ["value"],
            where: { name: "modRole", guild: interaction.guild.id },
        });

        if (
            !interaction.member.roles.cache.some(
                (role) => role.id === modRole?.value
            ) &&
            !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
        ) {
            return interaction.editReply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const username = interaction.options.getString("username");
        const avatar = interaction.options.getAttachment("avatar")?.url;
        const webhook = await interaction.channel.createWebhook(
            username ? username : "JackBot",
            {
                avatar: avatar
                    ? avatar
                    : await interaction.client.user.avatarURL({ dynamic: true }),
            }
        );

        if (interaction.options.getString("json")) {
            try {
                var json = await JSON.parse(interaction.options.getString("json"));
            } catch (error) {
                await webhook.delete();
                return await interaction.editReply({
                    content: "JSON parse error! Please try again.",
                });
            }

            try {
                await webhook.send(json);
            } catch (error) {
                await webhook.delete();
                return await interaction.editReply({ content: "Invalid embed! Please try again using a different structure." })
            }
        } else {
            const embed = new MessageEmbed();
            if (interaction.options.get("color")) {
                try {
                    embed.setColor(interaction.options.getString("color"))
                } catch (error) {
                    await webhook.delete();
                    return await interaction.editReply({ content: "Invalid color! Please try again using a number or name in capitals." })
                }
            }

            if (interaction.options.get("url")) {
                try {
                    url = new URL(interaction.options.getString("url"));
                } catch (error) {
                    await webhook.delete();
                    return await interaction.editReply({ content: "Invalid url! Make sure to include `http://` or `https://`." })
                }
                embed.setURL(url)
            }

            if (interaction.options.get("fields")) {
                var jsonArray = []
                var optionArray = interaction.options.getString("fields").split(", ")

                optionArray.forEach(e => {
                    var arr = e.split(":");
                    jsonArray.push({ "name": arr[0], "value": arr[1], "inline": interaction.options.getBoolean("inline-fields") ? true : false })
                });

                try {
                    embed.addFields(jsonArray)
                } catch (error) {
                    await webhook.delete();
                    return await interaction.editReply({ content: "Field parse error! Please try again using the format `name:value`." })
                }

            }

            interaction.options.get("title") ? embed.setTitle(interaction.options.getString("title")) : null;
            interaction.options.get("description") ? embed.setDescription(interaction.options.getString("description")) : null;
            interaction.options.get("footer") ? embed.setFooter({ text: interaction.options.getString("footer") }) : null;
            interaction.options.get("image") ? embed.setImage(interaction.options.getAttachment("image").url) : null;
            interaction.options.get("small-image") ? embed.setThumbnail(interaction.options.getAttachment("small-image").url) : null;
            interaction.options.getBoolean("timestamp") ? embed.setTimestamp() : null




            try {
                await webhook.send({
                    embeds: [embed],
                });
            } catch (error) {
                await webhook.delete();
                return await interaction.editReply({ content: "Invalid embed! Please try again using a different structure." })
            }
        }

        await webhook.delete();
        await interaction.editReply({ content: "Embed sent!" });
    }
};
