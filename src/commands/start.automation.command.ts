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
      const ms = Number.randomIntFromInterval(15000, 30000)
      const { browser, hasEnrolled } = await this.crawlerService.run()

      if (hasEnrolled) {
        setInterval(
          () => Log.channel('telegram').success('browser is open'),
          5000
        )

        /**
         * Keep event loop running so browser will keep open.
         */
        await new Promise(() => {})
      }

      Log.error(
        `appointment still not available, closing browser and retrying in ${ms} ms to avoid rate limit issues.`
      )
      await browser.close()
      await Exec.sleep(ms)
    }
  }
}
