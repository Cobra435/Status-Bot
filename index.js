const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder } = require(`discord.js`);
const config = require('./config.js'); // Import your configuration file
const {token, channelID, messageID, roleID, guildID, allowedRoleID,} = config;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ]
});

client.on('ready', async () => {
  console.log('Bot is ready!');

  const websites = config.websites;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Don`t Touch Anything Below If You Don`t Know What Your Doing/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getDMStatus() {
    return config.sendDirectMessages ? '`Enabled`' : '`Disabled`';
  }
  setInterval(async () => {
    const guild = client.channels.cache.get(channelID).guild;
    const serverName = guild.name;
    var embed = new EmbedBuilder()
      .setTitle(serverName)
      .setDescription("**Server Status - Information**")
      .setColor(0xFF0000)
      .setFooter({ text: serverName, iconURL: guild.iconURL() });

    await websites.forEach((website) => {
      const request = require('request');

      request(website.url, (error, response, body) => {
        const status = error ? 'Offline - ❌' : 'Online - ✅';
        website.status = status;
        if (website.status === 'Offline - ❌') {
          if (config.sendDirectMessages && !website.dm) {
            const role = guild.roles.cache.get(roleID);

            guild.members.fetch()
              .then((members) => {
                members.each((member) => {
                  if (!member.user.bot && member.id !== client.user.id && member.roles.cache.has(roleID)) {
                    const now = new Date();
                    const formattedDateTime = now.toLocaleString();
                    const guild = client.channels.cache.get(channelID).guild;
                    const serverName = guild.name;
                    const embed = new EmbedBuilder()
                      .setTitle(serverName)
                      .setThumbnail(client.channels.cache.get(channelID).guild.iconURL())
                      .setDescription('**🔴 Server Down:** ' + website.name)
                      .setColor(0xFF0000)
                      .setFooter({ text: serverName, iconURL: guild.iconURL() });

                    member.send({ embeds: [embed] })
                      .catch((err) => {
                        if (err.message === "Cannot send messages to this user") {
                          console.error("Cannot send messages to user with ID they either have the bot blocked or direct messages aren`t enabled:", member.id);
                        } else {
                          console.error("Failed to send a message to user with ID:", member.id, err);
                        }
                      });
                  }
                });
                website.dm = true;
              })
              .catch((error) => {
                console.error("Failed to fetch members:", error);
                website.dm = false;
              });
          }
          website.downtime += 10;
        } else {
          website.dm = false;
          website.downtime = 0;
        }
      });
    });

    websites.forEach((website) => {
      if (website.status === 'Offline - ❌') {
        const downtime = website.downtime;
        const days = Math.floor(downtime / 86400);
        const hours = Math.floor((downtime % 86400) / 3600);
        const minutes = Math.floor((downtime % 3600) / 60);
        const seconds = downtime % 60;

        const formattedTime = `${days}D ${hours}H ${minutes}M ${seconds}S`;

        embed.addFields({
          name: `${website.name}\nOffline - ❌`,
          value: `**Downtime:** \`${formattedTime}\``,
          inline: false
        });
      } else {
        embed.addFields({ name: website.name, value: website.status });
      }
    });
    embed.addFields(
      // Existing fields...
      {
        name: 'Direct Messages',
        value: getDMStatus(),
        inline: false,
      }
    );
    embed.setThumbnail(client.channels.cache.get(channelID).guild.iconURL());

    if (messageID) {
      client.channels.cache.get(channelID).messages.fetch(messageID)
        .then((message) => message.edit({ embeds: [embed] }))
        .catch(console.error);
    } else {
      client.channels.cache.get(channelID).send({ embeds: [embed] })
        .then((message) => messageID = message.id)
        .catch(console.error);
    }
  }, 10000);
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, member } = interaction;
  const senderHasPermission = member.roles.cache.map(role => role.id).includes(allowedRoleID);


  if (commandName === 'disabledm') {
    if (senderHasPermission) {
      if (config.sendDirectMessages) {
        config.sendDirectMessages = false;
        await interaction.reply('Direct messages are now disabled.');
      } else {
        await interaction.reply('Direct messages are already disabled.');
      }
    } else {
      await interaction.reply('You do not have permission to use this command.');
    }
  }

  if (commandName === 'enabledm') {
    if (senderHasPermission) {
      if (!config.sendDirectMessages) {
        config.sendDirectMessages = true;
        await interaction.reply('Direct messages are now enabled.');
      } else {
        await interaction.reply('Direct messages are already enabled.');
      }
    } else {
      await interaction.reply('You do not have permission to use this command.');
    }
  }
});
client.on('ready', () => {
  client.application.commands.create({
    name: 'disabledm',
    description: 'Disable direct messages',
  });
  client.application.commands.create({
    name: 'enabledm',
    description: 'Enable direct messages',
  });
});

client.login(token);