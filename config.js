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
      url: 'http://example.com',  // Replace with your website URL
      status: 'Online - ✅',
      dm: false,
      downtime: 0,
    },
    // Add more websites as needed
  ],  // Configuration for Monitoring Websites
  commands: {
    disableDM: { name: 'disabledm', description: 'Disable direct messages'},
    enableDM: { name: 'enabledm', description: 'Enable direct messages'},
  },  // Configuration for Bot Commands
  figletFonts: ['Graffiti', 'Standard', 'Varsity', 'Stop', 'Speed', 'Slant', 'Pagga', 'Larry 3D'], // Custom Font Options for Figlet (if applicable)
};
