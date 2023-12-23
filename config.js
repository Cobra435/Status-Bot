module.exports = {
  token: '',  // Bot Token
  channelID: '',  // Discord Channel ID for Status Messages
  messageID: '',  // Discord Message ID for Updating Status Messages
  port: 3000,  // Port for the server
  roleID: '',  // Role ID to Mention when Server is Down
  guildID: '',  // Discord Guild ID
  allowedRoleID: '',  // Allowed Role ID for Using Commands
  sendDirectMessages: true,  // Option to Send Direct Messages
  logChannelId: '',  // Discord Log Channel ID
  websites: [
    {
      name: 'Website 1',
      url: 'http://petro.projectphil.co.uk:4005',
      status: 'Online - ✅',
      dm: false,
      downtime: 0,
    },
    // Add more websites as needed
  ],  // Configuration for Monitoring Websites
  commands: {},  // Configuration for Bot Commands
  figletFonts: [],  // Custom Font Options for Figlet (if applicable)

};
