module.exports = {
  token: '',
  channelID: '',
  messageID: '',
  roleID: '',
  guildID: '',
  allowedRoleID: '',
  sendDirectMessages: true,
  logChannelId: '', // Add this line if you have a log channel

  websites: [
    { name: 'Website 1', url: '', status: 'Online - ✅', dm: false, downtime: 0 },
  ],

  commands: {
    disableDM: {
      name: 'disabledm',
      description: 'Disable direct messages',
    },
    enableDM: {
      name: 'enabledm',
      description: 'Enable direct messages',
    },
  },
};
