const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js'), request = require('request'), config = require('./config.js'), figlet = require('figlet'), chalk = require('chalk'), express = require('express'), app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Map();
client.buttons = new Map();
client.selectMenus = new Map();
client.modals = new Map();

client.on('ready', async () => {
  console.clear()
  app.listen(config.port)
  let font = await maths(["Graffiti", "Standard", "Varsity", "Stop", "Speed", "Slant", "Pagga", "Larry 3D"]);
  figlet.text("Status Bot", { font: font, width: 700 }, async function (err, text,) {
    logger({ string: text, type: "figlet" })
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━ Bot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger({ string: `Created by Cobra & ProjectPhil - Strike-Modifications `, type: "info" })
    logger({ string: `Guilds: '${client.guilds.cache.size}' Users: '${client.users.cache.size}' Channels: '${client.channels.cache.size}'`, type: "INFO" });
    logger({ string: `A Total Of '${client.commands?.size}' Command(s) '${client.buttons?.size}' Button(s) '${client.selectMenus?.size}' Select Menu(s) '${client.modals?.size}' Modal(s)`, type: "info" });
    logger({ string: `Bot ID ${client.user.id}`, type: "info" })
    logger({ string: `Logged In As ${client.user.tag}`, type: "success" })
    logger({ string: `Running On Port ${config.port}`, type: "success" })
    logger({ string: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`, type: "invite" })
  })

  setInterval(async () => {
    const guild = client.channels.cache.get(config.channelID).guild;
    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setDescription('**Server Status - Information**')
      .setColor(0xFF0000)
      .setFooter({ text: guild.name, iconURL: guild.iconURL() });

    await Promise.all(config.websites.map(async (website) => {
      try {
        const { error, response } = await makeRequest(website.url);

        const status = error ? 'Offline - ❌' : 'Online - ✅';
        website.status = status;

        if (website.status === 'Offline - ❌' && config.sendDirectMessages && !website.dm) {
          sendDMOnServerDown(guild, website);
          website.dm = true;
        } else {
          website.dm = false;
          website.downtime = 0;
        }
      } catch (error) {
        console.error('Failed to make a request:', error);
      }
    }));

    config.websites.forEach((website) => {
      if (website.status === 'Offline - ❌') {
        const formattedTime = getFormattedDowntime(website.downtime);

        embed.addFields({
          name: `${website.name}\nOffline - ❌`,
          value: `**Downtime:** \`${formattedTime}\``,
          inline: false,
        });
      } else {
        embed.addFields({ name: website.name, value: website.status });
      }
    });

    embed.addFields({
      name: 'Direct Messages',
      value: getDMStatus(),
      inline: false,
    });

    embed.setThumbnail(client.channels.cache.get(config.channelID).guild.iconURL());
    if (config.messageID) {
      client.channels.cache.get(config.channelID).messages.fetch(config.messageID)
        .then((message) => message.edit({ embeds: [embed] }))
        .catch(console.error);
    } else {
      client.channels.cache.get(config.channelID).send({ embeds: [embed] })
        .then((message) => config.messageID = message.id)
        .catch(console.error);
    }
    createCommands(config.commands);
  }, 10000);
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, member } = interaction;
  const senderHasPermission = member.roles.cache.map(role => role.id).includes(config.allowedRoleID);

  if (commandName === config.commands.disableDM.name) {
    handleDisableDMCommand(interaction, senderHasPermission);
  }

  if (commandName === config.commands.enableDM.name) {
    handleEnableDMCommand(interaction, senderHasPermission);
  }
});

function makeRequest(url) {
  return new Promise((resolve) => {
    request(url, (error, response, body) => {
      resolve({ error, response });
    });
  });
}
function getFormattedDowntime(downtime) {
  const days = Math.floor(downtime / 86400);
  const hours = Math.floor((downtime % 86400) / 3600);
  const minutes = Math.floor((downtime % 3600) / 60);
  const seconds = downtime % 60;

  return `${days}D ${hours}H ${minutes}M ${seconds}S`;
}
function sendDMOnServerDown(guild, website) {
  guild.members.fetch().then((members) => {
    members.each((member) => {
      if (!member.user.bot && member.id !== client.user.id && member.roles.cache.has(config.roleID)) {
        const now = new Date();
        const embed = new EmbedBuilder()
          .setTitle(guild.name)
          .setThumbnail(client.channels.cache.get(config.channelID).guild.iconURL())
          .setDescription(`**🔴 Server Down:** ${website.name}`)
          .setColor(0xFF0000)
          .setFooter({ text: guild.name, iconURL: guild.iconURL() });

        member.send({ embeds: [embed] })
          .catch((err) => {
            handleDMError(err, member.id);
          });
      }
    });
    website.dm = true;
  })
    .catch((error) => {
      console.error('Failed to fetch members:', error);
      website.dm = false;
    });
}
function handleDMError(err, memberId) {
  if (err.message === 'Cannot send messages to this user') {
    console.error('Cannot send messages to the user with ID; either they have the bot blocked or direct messages aren\'t enabled:', memberId);
  } else {
    console.error('Failed to send a message to the user with ID:', memberId, err);
  }
}
function handleDisableDMCommand(interaction, senderHasPermission) {
  if (senderHasPermission) {
    if (config.sendDirectMessages) {
      config.sendDirectMessages = false;
      sendDMStatusChangeMessage(interaction, 'Direct messages are now disabled.', '#ff0000');
    } else {
      sendDMStatusChangeMessage(interaction, 'Direct messages are already disabled.', '#ff0000');
    }
  } else {
    sendPermissionErrorMessage(interaction);
  }
}
function handleEnableDMCommand(interaction, senderHasPermission) {
  if (senderHasPermission) {
    if (!config.sendDirectMessages) {
      config.sendDirectMessages = true;
      sendDMStatusChangeMessage(interaction, 'Direct messages are now enabled.', '#00ff00');
    } else {
      sendDMStatusChangeMessage(interaction, 'Direct messages are already enabled.', '#00ff00');
    }
  } else {
    sendPermissionErrorMessage(interaction);
  }
}
function sendDMStatusChangeMessage(interaction, content, color) {
  interaction.reply({ content, ephemeral: true })
    .then(() => {
      const guild = client.channels.cache.get(config.channelID).guild;
      const logEmbed = new EmbedBuilder()
        .setTitle(guild.name)
        .setThumbnail(client.channels.cache.get(config.channelID).guild.iconURL())
        .setDescription(`${interaction.user.tag} ${content}`)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: guild.name, iconURL: guild.iconURL() });

      const logChannel = interaction.guild.channels.cache.get(config.logChannelId);

      if (logChannel && logChannel.type === 'GUILD_TEXT') {
        logChannel.send({ embeds: [logEmbed] });
      } else {
        console.log('Log channel not found or invalid!');
      }
    });
}
function sendPermissionErrorMessage(interaction) {
  interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
}
function createCommands(commands) {
  Object.values(commands).forEach((command) => {
    client.application.commands.create({
      name: command.name,
      description: command.description,
    });
  });
}
function maths(array) {
  let bruh = array[Math.floor(array.length * Math.random())];
  return bruh;
}
function logger(data = { string, type }) {
  switch (data.type.toLowerCase()) {
    case "info": console.log(chalk.white("[ ") + chalk.bold.white("INFO") + chalk.white(" ]: ") + data.string)
      break;
    case "success": console.log(chalk.white("[ ") + chalk.bold.green("SUCCESS") + chalk.white(" ]: ") + data.string)
      break;
    case "error": console.log(chalk.white("[ ") + chalk.bold.red("ERROR") + chalk.white(" ]: ") + data.string)
      break;
    case "modules": console.log(chalk.white("[ ") + chalk.bold.magenta("MODULES") + chalk.white(" ]: ") + data.string)
      break;
    case "figlet": console.log(chalk.bold.blue(data.string))
      break;
    case "invite": console.log(chalk.white("[ ") + chalk.bold.red("INVITE:") + chalk.white(" ]: ") + data.string)
      break;
    case "versionchecker": console.log(chalk.white("[ ") + chalk.bold.red("Version Checker:") + chalk.white(" ]: ") + data.string)
      break;
    case "license": console.log(chalk.white("[ ") + chalk.bold.red("LICSYS:") + chalk.white(" ]: ") + data.string)
      break;
    case "commands": console.log(chalk.white("[ ") + chalk.bold.red("COMMANDS ERROR:") + chalk.white(" ]: ") + data.string)
      break;
    case "mysql": console.log(chalk.white("[ ") + chalk.bold.red("MYSQL:") + chalk.white(" ]: ") + data.string)

  }
}
function getDMStatus() {
  return config.sendDirectMessages ? '`Enabled`' : '`Disabled`';
}

client.login(config.token);
