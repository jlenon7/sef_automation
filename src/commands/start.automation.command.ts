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
    let formIsOpen = false

    while (!formIsOpen) {
      const ms = Number.randomIntFromInterval(15000, 30000)
      const { browser, hasForm } = await this.crawlerService.run()

      if (hasForm) {
        formIsOpen = true
        setInterval(() => Log.channel('telegram').success('form is open'), ms)
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
