import { Path } from '@athenna/common'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that gets used when writing
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration object.
  |
  */

  default: Env('LOG_CHANNEL', 'stack'),

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application.
  |
  | Available Drivers:
  |   "stack", "console", "discord", "file", "null", "slack", "telegram".
  | Available Formatters:
  |   "cli", "simple", "json", "request", "message".
  |
  */

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

    exception: {
      level: 'trace',
      formatter: 'none',
      driver: 'console',
      streamType: 'stderr'
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
      level: 'debug',
      chatId: Env('TELEGRAM_CHAT_ID'),
      parseMode: 'HTML',
      token: Env('TELEGRAM_TOKEN'),

      formatter: 'message',
      formatterConfig: {}
    }
  }
}
