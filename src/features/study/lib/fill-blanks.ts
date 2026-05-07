export interface FillBlankDescriptor {
  id: string
}

const BLANK_TAG_RE = /<Blank\b([^>]*)>(?:[\s\S]*?)<\/Blank>|<Blank\b([^>]*)\/>/g
const ANSWER_TAG_RE = /<Answer\b([^>]*)>([\s\S]*?)<\/Answer>/g
const ID_ATTR_RE = /\bid=(['"])(.*?)\1/

function extractId(attributes: string, fallbackIndex: number) {
  const matched = attributes.match(ID_ATTR_RE)
  return matched?.[2]?.trim() || String(fallbackIndex + 1)
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, ' ')
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function cleanAnswerText(value: string) {
  return decodeHtmlEntities(stripTags(value))
    .replace(/[_*`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractFillBlankDescriptors(source: string): FillBlankDescriptor[] {
  const blanks: FillBlankDescriptor[] = []

  for (const match of source.matchAll(BLANK_TAG_RE)) {
    const attributes = match[1] ?? match[2] ?? ''
    blanks.push({
      id: extractId(attributes, blanks.length),
    })
  }

  return blanks
}

export function extractAnswerMap(source: string) {
  const answers = new Map<string, string>()
  let index = 0

  for (const match of source.matchAll(ANSWER_TAG_RE)) {
    const attributes = match[1] ?? ''
    const rawAnswer = match[2] ?? ''

    answers.set(extractId(attributes, index), cleanAnswerText(rawAnswer))
    index += 1
  }

  return answers
}

export function normalizeFillBlankValue(value: string) {
  return value
    .trim()
    .replace(/[_*`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase()
}

export function compareFillBlankValue(input: string, expected: string) {
  return normalizeFillBlankValue(input) === normalizeFillBlankValue(expected)
}
