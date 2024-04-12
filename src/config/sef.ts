import { Env } from '@athenna/config'

export default {
  websiteUrl: Env('SEF_WEBSITE_URL', ''),
  authEmail: Env('SEF_AUTH_EMAIL', ''),
  authPassword: Env('SEF_AUTH_PASSWORD', ''),
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
