import { Log } from '@athenna/logger'
import { Inject } from '@athenna/ioc'
import { BaseCommand } from '@athenna/artisan'
import { Exec, Number } from '@athenna/common'
import type { CrawlerService } from '#src/services/crawler.service'

export class StartAutomationCommand extends BaseCommand {
  @Inject()
  public crawlerService: CrawlerService

  public static signature(): string {
    return 'start:automation'
  }

  public static description(): string {
    return 'Start the SEF Automation to make an appointment.'
  }

  public async handle(): Promise<void> {
    while (true) {
      const ms = Number.randomIntFromInterval(5000, 15000)
      const email = Config.get('sef.authEmail')
      const { browser, hasEnrolled } = await this.crawlerService.run()

      if (hasEnrolled) {
        await Log.channel('telegram').success(
          `appointment successfully enrolled for ${email}`
        )

        await browser.close()

        break
      }

      Log.error(
        `appointment still not available for user ${email}, closing browser and retrying in ${ms} ms to avoid rate limit issues.`
      )
      await browser.close()
      await Exec.sleep(ms)
    }
  }
}
