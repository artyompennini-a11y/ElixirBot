// by elixir
import axios from 'axios'
import { load } from 'cheerio'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

const blockedSites = [
  'https://receive-smss.com',
  'https://receive-sms.cc',
  'https://sms24.me',
  'https://onlinesim.io'
]

function normalizeNumber(n) {
  if (!n) return ''
  n = String(n).trim()
  const plusMatch = n.match(/\+\d{6,15}/)
  if (plusMatch) return plusMatch[0]
  const digits = n.replace(/[^0-9]/g, '')
  if (digits.length >= 6 && digits.length <= 15) return `+${digits}`
  return n
}

async function tryAxios(url) {
  try {
    const res = await axios.get(url, { headers, timeout: 10000 })
    return { ok: true, status: res.status, data: res.data }
  } catch (e) {
    return { ok: false, status: e?.response?.status || null, error: (e && e.message) || e }
  }
}

async function tryPuppeteer(url) {
  try {
    const puppeteer = (await import('puppeteer')).default
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setUserAgent(headers['User-Agent'])
    await page.setExtraHTTPHeaders({ Accept: headers.Accept })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    const content = await page.content()
    await browser.close()
    return { ok: true, data: content }
  } catch (e) {
    return { ok: false, error: (e && e.message) || e }
  }
}

function extractNumbersFromHtml(html) {
  const $ = load(html)
  const textCandidates = []
  $('a, td, div, span, li, p').each((i, el) => textCandidates.push($(el).text()))
  $('a').each((i, el) => { const href = $(el).attr('href') || ''; if (href) textCandidates.push(href) })
  const raw = textCandidates.join('\n')
  let match = raw.match(/\+\d{6,15}/g) || raw.match(/\b\d{6,15}\b/g) || []
  match = match.map(m => normalizeNumber(m)).filter(Boolean)
  return [...new Set(match)]
}

;(async () => {
  console.log('Puppeteer fallback tester for blocked VOIP/SMS sites')
  const summary = []
  for (const site of blockedSites) {
    console.log('\n--- Testing', site, '---')
    const a = await tryAxios(site)
    if (a.ok) {
      console.log('Axios: success (status', a.status + ')')
      const nums = extractNumbersFromHtml(a.data)
      console.log('Numbers found:', nums.length ? nums.slice(0, 20) : 'none')
      summary.push({ site, method: 'axios', status: a.status, count: nums.length })
      continue
    }
    console.log('Axios failed, status/err:', a.status || a.error)

    console.log('Attempting Puppeteer fallback (requires puppeteer installed)...')
    const p = await tryPuppeteer(site)
    if (!p.ok) {
      console.log('Puppeteer failed:', p.error)
      summary.push({ site, method: 'puppeteer', ok: false, error: p.error })
      continue
    }
    console.log('Puppeteer: success')
    const nums = extractNumbersFromHtml(p.data)
    console.log('Numbers found:', nums.length ? nums.slice(0, 50) : 'none')
    summary.push({ site, method: 'puppeteer', ok: true, count: nums.length })
  }

  console.log('\n=== Summary ===')
  summary.forEach(s => console.log(s))
  console.log('\nDone')
})()
