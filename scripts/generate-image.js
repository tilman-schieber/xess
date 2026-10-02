// scripts/generate-image.js
// Generate (or edit) an image with the Google Gemini image API and save it to disk.
//
//   node scripts/generate-image.js --out public/art/hero.png --prompt "..." [--aspect 16:9] [--input ref.png]
//
// The API key is read from GEMINI_API_KEY, either in the environment or in .env.local
// (gitignored). The model can be overridden with GEMINI_IMAGE_MODEL.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_MODEL = 'gemini-2.5-flash-image'
const MIME_BY_EXT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }

function readEnvLocal() {
  const path = resolve(repoRoot, '.env.local')
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')]
      }),
  )
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue
    args[argv[i].slice(2)] = argv[i + 1]
    i += 1
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const env = { ...readEnvLocal(), ...process.env }
const apiKey = env.GEMINI_API_KEY
const model = env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL

if (!args.prompt || !args.out) {
  console.error('Usage: node scripts/generate-image.js --out <file> --prompt "<text>" [--aspect 16:9] [--input <image>]')
  process.exit(2)
}
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Add it to .env.local (GEMINI_API_KEY=...) or export it.')
  process.exit(2)
}

const parts = [{ text: args.prompt }]
if (args.input) {
  const inputPath = resolve(repoRoot, args.input)
  const mimeType = MIME_BY_EXT[extname(inputPath).toLowerCase()]
  if (!mimeType) {
    console.error(`Unsupported input image type: ${args.input}`)
    process.exit(2)
  }
  parts.push({ inlineData: { mimeType, data: readFileSync(inputPath).toString('base64') } })
}

const body = { contents: [{ parts }] }
if (args.aspect) body.generationConfig = { imageConfig: { aspectRatio: args.aspect } }

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  },
)

const payload = await response.json().catch(() => null)
if (!response.ok) {
  console.error(`Gemini API error ${response.status}: ${payload?.error?.message ?? response.statusText}`)
  process.exit(1)
}

const responseParts = payload?.candidates?.[0]?.content?.parts ?? []
const image = responseParts.find(part => part.inlineData?.data)
if (!image) {
  const text = responseParts.map(part => part.text).filter(Boolean).join(' ')
  console.error(`No image in the response.${text ? ` Model said: ${text}` : ''}`)
  process.exit(1)
}

const outPath = resolve(repoRoot, args.out)
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, Buffer.from(image.inlineData.data, 'base64'))
console.log(`Wrote ${outPath} (${image.inlineData.mimeType}, model ${model})`)
