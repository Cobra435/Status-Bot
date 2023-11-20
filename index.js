const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});
//Discord Token//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const token = 'Put Your Token Here'; // Your Discord bot token
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('ready', async () => {
  console.log('Bot is ready!');

  var websites = [
    { name: 'Change Me - Name Slot 1', url: 'Your Link Here', status: 'Loading...', downtime: 0, dm: false },
    { name: 'Change Me - Name Slot 2', url: 'Your Link Here', status: 'Loading...', downtime: 0, dm: false },
  ];
  
//Discord Settings//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const channelID = 'Put Channel ID Here'; // Set The Channel ID
  let messageID = 'Put Embed ID Here'; // Set The Message ID after the the first embed is sent
  const roleID = 'Put Role ID HERE'; // Put the Role Id You Want Messaged Here - This will message everyone with that role
  const guild = client.guilds.cache.get('Put Guild ID Here'); // Put the guild id here - aka the server id
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 // Don`t Touch Anything Below If You Don`t Know What Your Doing/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(async () => {
const guild = client.channels.cache.get(channelID).guild;
const serverName = guild.name;
    var embed = new EmbedBuilder()
      .setTitle(serverName)
      .setDescription("**Server Status - Information**")
      .setColor(0xFF0000)
        .setFooter({ text: serverName, iconURL: guild.iconURL() });

  await websites.forEach((website) => {
      // Check if the website is online
      const request = require('request');

    request(website.url, (error, response, body) => {
        const status = error ? 'Offline - ❌' : 'Online - ✅';
        website.status = status;
      if (website.status === 'Offline - ❌') {
        if (!website.dm) {
          const role = guild.roles.cache.get(roleID);

          guild.members.fetch()
            .then((members) => {
              members.each((member) => {
                if (!member.user.bot && member.id !== client.user.id && member.roles.cache.has(roleID)) {
                 const now = new Date();
  const formattedDateTime = now.toLocaleString(); // Format the date and time as a string
const guild = client.channels.cache.get(channelID).guild;
const serverName = guild.name;
  const embed = new EmbedBuilder()
      .setTitle(serverName)
.setThumbnail(client.channels.cache.get(channelID).guild.iconURL())
    .setDescription('**🔴 Server Down:** ' + website.name)
    .setColor(0xFF0000)
  .setFooter({ text: serverName, iconURL: guild.iconURL() });
    //.setFooter({ text: servername, iconURL: client.channels.cache.get(channelID).guild.iconURL() });
	

  member.send({ embeds: [embed] })
                    .catch((err) => {
                      if (err.message === "Cannot send messages to this user") {
                        console.error("Cannot send messages to user with ID:", member.id);
                        // Handle this specific error case here
                      } else {
                        console.error("Failed to send a message to user with ID:", member.id, err);
                        // Handle other errors here
                      }
                    });
                }
              });
              website.dm = true;
            })
            .catch((error) => {
              console.error("Failed to fetch members:", error);
              website.dm = false; // Set dm to false in case of an error
            });
        }
        website.downtime += 10; // Increment downtime by 10 seconds
      } else {
        website.dm = false;
        website.downtime = 0; // Reset downtime when the website is online
      }

    })});

    websites.forEach((website) => {
      if (website.status === 'Offline - ❌') {
        embed.addFields({ name: website.name, value: website.status, inline: true });

        const downtime = website.downtime;
        const days = Math.floor(downtime / 86400); // 86400 seconds in a day
        const hours = Math.floor((downtime % 86400) / 3600); // 3600 seconds in an hour
        const minutes = Math.floor((downtime % 3600) / 60); // 60 seconds in a minute
        const seconds = downtime % 60;

        const formattedTime = `${days}D ${hours}H ${minutes}M ${seconds}S`;

        embed.addFields({ name: 'Downtime:', value: formattedTime, inline: true });
      } else {
        embed.addFields({ name: website.name, value: website.status });
      }
    });

    embed.setThumbnail(client.channels.cache.get(channelID).guild.iconURL()); // Replace with the server logo URL

    if (messageID) {
      // Edit the existing message
      client.channels.cache.get(channelID).messages.fetch(messageID)
        .then((message) => message.edit({ embeds: [embed] }))
        .catch(console.error);
    } else {
      // Send a new message and store its ID
      client.channels.cache.get(channelID).send({ embeds: [embed] })
        .then((message) => messageID = message.id)
        .catch(console.error);
    }
  }, 10000); // Check the websites every 10 seconds
});


client.login(token);