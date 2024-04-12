import { Path } from '@athenna/common'

export default {
  default: Env('LOG_CHANNEL', 'stack'),

  channels: {
    stack: {
      driver: 'stack',
      channels: ['simple']
    },

    simple: {
      driver: 'console',
      level: 'trace',

      formatter: 'simple'
    },

    discard: {
      driver: 'null'
    },

    file: {
      driver: 'file',
      level: 'trace',
      filePath: Path.logs('athenna.log'),

      formatter: 'simple',
      formatterConfig: {}
    },

    slack: {
      driver: 'slack',
      level: 'fatal',
      url: 'your-slack-webhook-url',

      formatter: 'message',
      formatterConfig: {}
    },

    discord: {
      driver: 'discord',
      level: 'fatal',
      username: 'Athenna',
      url: 'your-discord-webhook-url',

      formatter: 'message',
      formatterConfig: {}
    },

    telegram: {
      driver: 'telegram',
      formatter: 'message',
      formatterConfig: {},

      token: Env('TELEGRAM_TOKEN'),
      chatId: Env('TELEGRAM_CHAT_ID'),
      parseMode: 'HTML'
    }
  }
}
