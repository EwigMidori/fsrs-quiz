import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { compile } from '@mdx-js/mdx'
import katex from 'katex'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const decksDir = path.join(repoRoot, 'decks')

const FORMULA_TAG_RE = /<(InlineFormula|BlockFormula)>([\s\S]*?)<\/\1>/g

async function loadDeckFiles() {
  const entries = await readdir(decksDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(decksDir, entry.name))
    .sort()
}

function rewriteFormulaTags(source) {
  return source.replace(FORMULA_TAG_RE, (_match, tag, formula) => {
    const expression = JSON.stringify(formula.trim())
    return `<${tag} expression={${expression}} />`
  })
}

async function validateMdx(source, context) {
  try {
    await compile(rewriteFormulaTags(source), {
      jsx: true,
      outputFormat: 'function-body',
      development: false,
    })
  } catch (error) {
    throw new Error(
      `${context}: MDX parse failed\n${formatError(error)}\n---\n${source}\n---`,
    )
  }
}

function validateFormulaSyntax(source, context) {
  const matches = [...source.matchAll(FORMULA_TAG_RE)]

  for (const match of matches) {
    const tag = match[1]
    const formula = match[2].trim()

    if (!formula) {
      throw new Error(`${context}: ${tag} is empty`)
    }

    try {
      katex.renderToString(formula, {
        displayMode: tag === 'BlockFormula',
        throwOnError: true,
        strict: 'error',
      })
    } catch (error) {
      throw new Error(
        `${context}: ${tag} KaTeX parse failed\n${formatError(error)}\n---\n${formula}\n---`,
      )
    }
  }

  return matches.length
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function validateDeckShape(deck, filePath) {
  if (!deck || typeof deck !== 'object') {
    throw new Error(`${filePath}: deck root must be an object`)
  }

  if (!Array.isArray(deck.cards)) {
    throw new Error(`${filePath}: deck.cards must be an array`)
  }
}

async function main() {
  const deckFiles = await loadDeckFiles()
  const failures = []

  let deckCount = 0
  let cardCount = 0
  let fieldCount = 0
  let formulaCount = 0

  for (const filePath of deckFiles) {
    const raw = await readFile(filePath, 'utf8')
    const relativePath = path.relative(repoRoot, filePath)
    let deck

    try {
      deck = JSON.parse(raw)
      validateDeckShape(deck, relativePath)
    } catch (error) {
      failures.push(`${relativePath}: JSON parse failed\n${formatError(error)}`)
      continue
    }

    deckCount += 1

    for (const [index, card] of deck.cards.entries()) {
      cardCount += 1
      const cardId =
        typeof card?.id === 'string' && card.id.trim()
          ? card.id.trim()
          : `index:${index}`

      for (const field of ['front', 'back']) {
        const source = card?.[field]
        const context = `${relativePath}#${cardId}.${field}`

        if (typeof source !== 'string') {
          failures.push(`${context}: expected string, got ${typeof source}`)
          continue
        }

        fieldCount += 1

        try {
          await validateMdx(source, context)
          formulaCount += validateFormulaSyntax(source, context)
        } catch (error) {
          failures.push(formatError(error))
        }
      }
    }
  }

  if (failures.length) {
    console.error(`MDX validation failed with ${failures.length} issue(s).\n`)
    for (const failure of failures) {
      console.error(failure)
      console.error('')
    }
    process.exitCode = 1
    return
  }

  console.log(
    [
      'MDX validation passed.',
      `Decks: ${deckCount}`,
      `Cards: ${cardCount}`,
      `Fields: ${fieldCount}`,
      `Formula blocks: ${formulaCount}`,
    ].join(' '),
  )
}

main().catch((error) => {
  console.error(formatError(error))
  process.exitCode = 1
})
