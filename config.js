module.exports = {
  token: 'MTE3OTQwMzM0Mzc3MzMwNjkzMA.G528jG.JSljlnfSSfwgLG92aOmgKoFKhLIfozt29d52tU',
  channelID: '1187510784822104174',
  messageID: '1187915690972299314',
  roleID: '1174187383042879549',
  guildID: '1174185500517609562',
  allowedRoleID: '1174187383042879549',
  sendDirectMessages: true,
  logChannelId: '1185591705349652562', // Add this line if you have a log channel

  websites: [
    { name: 'Website 1', url: 'http://petro.projectphil.co.uk:4005', status: 'Online - ✅', dm: false, downtime: 0 },
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
