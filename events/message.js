const fs = require("fs");
const shortenUrl = require("../functions/shortenUrl.js");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (
      !message.guild ||
      !message.channel.name.startsWith("ticket-") ||
      (message.author.bot &&
        !message.member.roles.cache.some(
          (role) => role.id === process.env.TICKET_ROLE
        ))
    )
      return;
    const date = `${new Intl.DateTimeFormat("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(message.createdTimestamp)}`;
    let logStr = `[${date}] [${message.author.username}]: ${
      message.attachments.size ? message.attachments.first().url : ""
    }${message.cleanContent}\n`;

    fs.writeFile(
      `./tmp/logs/${message.channel.id}.log`,
      `${logStr}`,
      { flag: "a+" },
      function (err) {
        if (err) console.error(err);
      }
    );
  },
};
