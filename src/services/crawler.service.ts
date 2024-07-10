import { chromium } from 'playwright'
import { Log } from '@athenna/logger'
import { Service } from '@athenna/ioc'
import { Exec, Path } from '@athenna/common'
import { Config } from '@athenna/config'

@Service()
export class CrawlerService {
  public async run() {
    try {
      const browser = await chromium.launch({
        args: ['--window-size=1280,720'],
        headless: true
      })

      let hasForm = false

      Log.info('bootstrapping chromium browser to find an appointment in SEF')

      const context = await browser.newContext({
        userAgent: Config.get('sef.userAgent')
      })

      const page = await context.newPage()

      await page.goto(Config.get('sef.websiteUrl'), {
        waitUntil: 'networkidle'
      })
      Log.info('reached SEF home page')

      await page
        .locator('.login-launcher', { hasText: 'Login ' })
        .click({ button: 'left' })
      Log.info('clicked sign-in button')

      await page.locator('id=txtUsername').fill(Config.get('sef.authEmail'))
      Log.info('filled up email input')

      await page.locator('id=txtPassword').fill(Config.get('sef.authPassword'))
      Log.info('filled up password input')

      await page.locator('id=btnLogin').click({ button: 'left' })
      Log.info('pressed login submit button')

      await page
        .locator(
          'id=ctl00_ctl53_g_59a32ede_8107_49fd_89e4_d64dcb5b7c73_ctl00_Scheduling'
        )
        .click({ button: 'left' })

      await page.locator('id=btnNovoAgendamento').click({ button: 'left' })
      Log.info('pressed new appointment button')

      const alreadyHaveAppointment = await page
        .locator(
          'id=ctl00_ctl53_g_25d4cf41_7b1b_4721_a599_eb873afd5d19_ctl00_LblCantReschedule'
        )
        .isVisible()

      if (alreadyHaveAppointment) {
        await Log.channel('stack', 'telegram').error(
          'user already has an appointment. only one can be scheduled'
        )

        return { browser, hasEnrolled: true }
      }

      Log.info('waiting for appointment form to be visible')

      await page
        .locator(
          'id=ctl00_ctl53_g_948e31d8_a34a_4c4d_aa9f_c457786c05b7_ctl00_lblServicesTitle'
        )
        .waitFor({ state: 'visible' })

      hasForm = await page
        .locator(
          'id=ctl00_ctl53_g_948e31d8_a34a_4c4d_aa9f_c457786c05b7_ctl00_lblPlaces'
        )
        .isVisible()

      Log.info(`form is ${hasForm ? 'visible' : 'not visible'}`)

      if (hasForm) {
        const logger = Log.channel('stack', 'telegram')

        await logger.info('appointment form is open')

        const cellphone = Config.get('sef.cellphone')

        await logger.info(`defining cellphone ${cellphone}`)
        await page.locator('id=txtTelephone').fill(cellphone)

        const selectElement = page.locator('select#Places_List')
        const options = await selectElement.evaluate(select => {
          const optionElements = select.querySelectorAll('option')
          return Array.from(optionElements)
            .map(option => option.value)
            .filter(Boolean)
        })

        await logger.info('options available %o to select', options)

        const randomIndex = Math.floor(Math.random() * options.length)
        const selectedOptionValue = options[randomIndex]

        await logger.info(`selected ${selectedOptionValue} option`)
        await selectElement.selectOption({ value: selectedOptionValue })

        const fcTitle = page.locator('.fc-title')
        await page.screenshot({
          path: Path.storage(`screenshots/${Date.now()}.png`)
        })
        await fcTitle.first().click({ button: 'left' })
        await page.screenshot({
          path: Path.storage(`screenshots/${Date.now()}.png`)
        })

        await logger.info(
          `found ${await fcTitle.count()} appointments available on calendar. clicking on first available`
        )

        await logger.info('clicking on "Marcar" button')
        await page
          .locator(
            'id=ctl00_ctl53_g_948e31d8_a34a_4c4d_aa9f_c457786c05b7_ctl00_btnSubmit'
          )
          .click({ button: 'left' })

        await logger.info('clicking on "Sim" button')
        await page
          .locator(
            'id=ctl00_ctl53_g_948e31d8_a34a_4c4d_aa9f_c457786c05b7_ctl00_btnConfirmCancel'
          )
          .click({ button: 'left' })

        await logger.success(
          `appointment probably enrolled, retrying immediately to confirm`
        )

        await browser.close()

        return await this.run()
      }

      return { browser, hasEnrolled: false }
    } catch (err) {
      const message = err.message
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('&', '&amp')

      Log.channel('telegram').error(
        'error happened while handling browser operation: %s',
        message
      )
      Log.error('error happened while handling browser operations: %o', err)
      Log.warn('retrying in 30 seconds')
      await Exec.sleep(30000)
      return await this.run()
    }
  }
}
