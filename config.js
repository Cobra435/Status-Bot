module.exports = {
  token: 'MTE3OTQwMzM0Mzc3MzMwNjkzMA.GOe53F.ROyXp0QZiuvWI2wFa5HNQqeV5ZUOemNbtv8jXQ',  // Bot Token
  channelID: '1187510784822104174',  // Discord Channel ID for Status Messages
  messageID: '1187919734528823356',  // Discord Message ID for Updating Status Messages
  port: 3000,  // Port for the server
  roleID: '1174187383042879549',  // Role ID to Mention when Server is Down
  guildID: '1174185500517609562',  // Discord Guild ID
  allowedRoleID: '1174187383042879549',  // Allowed Role ID for Using Commands
  sendDirectMessages: true,  // Option to Send Direct Messages
  logChannelId: '1185591705349652562',  // Discord Log Channel ID
  websites: [
    {
      name: 'Website 1',
      url: 'http://petro.projectphil.co.uk:4005',
      status: 'Online - ✅',
      dm: false,
      downtime: 0,
    },
  ],  // Configuration for Monitoring Websites
  commands: {
    disableDM: { name: 'disabledm', description: 'Disable direct messages'},
    enableDM: { name: 'enabledm', description: 'Enable direct messages'},
  },  // Configuration for Bot Commands
  figletFonts: ['Graffiti', 'Standard', 'Varsity', 'Stop', 'Speed', 'Slant', 'Pagga', 'Larry 3D'], // Custom Font Options for Figlet (if applicable)
};