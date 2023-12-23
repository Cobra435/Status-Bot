const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.js');
const request = require('request');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // ... (add other required intents)
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', async () => {
  console.log('Bot is ready!');

  const websites = config.websites;

  function getDMStatus() {
    return config.sendDirectMessages ? '`Enabled`' : '`Disabled`';
  }

  setInterval(async () => {
    const guild = client.channels.cache.get(config.channelID).guild;
    const serverName = guild.name;
    const embed = new EmbedBuilder()
      .setTitle(serverName)
      .setDescription('**Server Status - Information**')
      .setColor(0xFF0000)
      .setFooter({ text: serverName, iconURL: guild.iconURL() });

    await Promise.all(websites.map(async (website) => {
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

    websites.forEach((website) => {
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

    const messageID = config.messageID;

    if (messageID) {
      client.channels.cache.get(config.channelID).messages.fetch(messageID)
        .then((message) => message.edit({ embeds: [embed] }))
        .catch(console.error);
    } else {
      client.channels.cache.get(config.channelID).send({ embeds: [embed] })
        .then((message) => config.messageID = message.id)
        .catch(console.error);
    }
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

client.on('ready', () => {
  createCommands();
});

client.login(config.token);

async function makeRequest(url) {
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
  const role = guild.roles.cache.get(config.roleID);

  guild.members.fetch()
    .then((members) => {
      members.each((member) => {
        if (!member.user.bot && member.id !== client.user.id && member.roles.cache.has(config.roleID)) {
          const now = new Date();
          const serverName = guild.name;
          const embed = new EmbedBuilder()
            .setTitle(serverName)
            .setThumbnail(client.channels.cache.get(config.channelID).guild.iconURL())
            .setDescription(`**🔴 Server Down:** ${website.name}`)
            .setColor(0xFF0000)
            .setFooter({ text: serverName, iconURL: guild.iconURL() });

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
      const serverName = guild.name;
      const logEmbed = new EmbedBuilder()
        .setTitle(serverName)
        .setThumbnail(client.channels.cache.get(config.channelID).guild.iconURL())
        .setDescription(`${interaction.user.tag} ${content}`)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: serverName, iconURL: guild.iconURL() });

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
function createCommands() {
  const commands = config.commands;

  client.application.commands.create({
    name: commands.disableDM.name,
    description: commands.disableDM.description,
  });

  client.application.commands.create({
    name: commands.enableDM.name,
    description: commands.enableDM.description,
  });
}