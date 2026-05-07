import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

function usage() {
  console.error('Usage: node scripts/view-raw-batch.mjs <exam1|exam2> <start> [count]')
  process.exit(1)
}

const [, , deckName, startArg, countArg] = process.argv

if (!deckName || !startArg) {
  usage()
}

const start = Number.parseInt(startArg, 10)
const count = Number.parseInt(countArg ?? '5', 10)

if (!Number.isFinite(start) || !Number.isFinite(count) || start < 1 || count < 1) {
  usage()
}

const filePath = path.join(process.cwd(), 'raw', `${deckName}.txt`)
const raw = await readFile(filePath, 'utf8')

const blocks = [...raw.matchAll(/(?:^|\n)(?:#\s*)?Question\s+(\d+)[.:]([\s\S]*?)(?=\n(?:#\s*)?Question\s+\d+[.:]|$)/g)]
const byNumber = new Map(blocks.map((match) => [Number.parseInt(match[1], 10), match[0].trim()]))

for (let number = start; number < start + count; number += 1) {
  const block = byNumber.get(number)

  if (!block) {
    continue
  }

  process.stdout.write(`${'='.repeat(18)} Q${number} ${'='.repeat(18)}\n`)
  process.stdout.write(`${block}\n\n`)
}
