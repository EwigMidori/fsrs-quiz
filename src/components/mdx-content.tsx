import { evaluate } from '@mdx-js/mdx'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import * as React from 'react'
import * as runtime from 'react/jsx-runtime'

import { cn } from '@/lib/utils'

const MDX_COMPILER_REVISION = 'formula-expression-v3'
const mdxCache = new Map<
  string,
  {
    revision: string
    Content: React.ComponentType<Record<string, unknown>>
  }
>()
const FORMULA_TAG_RE = /<(InlineFormula|BlockFormula)>([\s\S]*?)<\/\1>/g

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function childrenToText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return childrenToText(child.props.children)
      }

      return ''
    })
    .join('')
}

function rewriteFormulaTags(source: string) {
  return source.replace(FORMULA_TAG_RE, (_match, tag, formula) => {
    const expression = JSON.stringify(formula.trim())
    return `<${tag} expression={${expression}} />`
  })
}

function normalizeKatexExpression(expression: string) {
  return expression
    .trim()
    .replace(/(?<!\\)%/g, '\\%')
    .replace(/([A-Za-z])_hat_([A-Za-z0-9]+)/g, '\\hat{$1}_{$2}')
    .replace(/_\(([^)]+)\)/g, '_{$1}')
    .replace(/(?<!\\)sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/(?<!\\)ln\(([^)]+)\)/g, '\\ln($1)')
    .replace(/(?<!\\)log\(([^)]+)\)/g, '\\log($1)')
    .replace(/(?<!\\)\balpha\b/g, '\\alpha')
    .replace(/(?<!\\)\bbeta\b/g, '\\beta')
    .replace(/(?<!\\)\bsigma\b/g, '\\sigma')
    .replace(/_(?!\{|\()([A-Za-z]{2,})/g, '_{$1}')
}

function renderKatex(expression: string, displayMode: boolean) {
  const normalized = normalizeKatexExpression(expression)

  try {
    return katex.renderToString(normalized || '\\text{ }', {
      displayMode,
      output: 'htmlAndMathml',
      throwOnError: false,
      strict: 'ignore',
      trust: false,
    })
  } catch {
    return `<span>${escapeHtml(expression)}</span>`
  }
}

function InlineFormula({
  expression,
  children,
}: React.PropsWithChildren<{ expression?: string }>) {
  const formula = expression ?? childrenToText(children)
  const html = React.useMemo(() => renderKatex(formula, false), [formula])

  return (
    <span
      className="inline-flex max-w-full items-center rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface-strong)] px-2.5 py-1 text-[color:var(--ink)] [&_.katex]:text-[1em]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function BlockFormula({
  expression,
  children,
}: React.PropsWithChildren<{ expression?: string }>) {
  const formula = expression ?? childrenToText(children)
  const html = React.useMemo(() => renderKatex(formula, true), [formula])

  return (
    <div
      className="my-4 overflow-x-auto rounded-[1.4rem] border border-[color:var(--hairline)] bg-[color:var(--canvas-soft)] px-4 py-3 text-[color:var(--ink)] [&_.katex-display]:my-0 [&_.katex-display]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function Blank({ id }: { id?: string }) {
  return (
    <span className="mx-1 inline-flex min-w-24 items-center justify-center rounded-[0.95rem] border border-dashed border-[color:var(--hairline-strong)] bg-white px-3 py-1.5 align-middle text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] shadow-sm">
      填空 {id ?? '?'}
    </span>
  )
}

function Answer({
  id,
  children,
}: React.PropsWithChildren<{ id?: string }>) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-[1rem] border border-[color:var(--hairline)] bg-[color:var(--surface-strong)] px-3 py-1.5 align-middle text-[color:var(--ink)] shadow-sm">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--ink)] text-[10px] font-semibold text-white">
        {id ?? '?'}
      </span>
      <span className="min-w-0 text-sm font-medium leading-6">{children}</span>
    </span>
  )
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className={cn('mb-4 text-2xl font-semibold tracking-tight', props.className)}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className={cn('mb-3 text-xl font-semibold tracking-tight', props.className)}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      {...props}
      className={cn('mb-3 leading-7 text-[color:var(--body-strong)]', props.className)}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className={cn('mb-3 list-disc space-y-1 pl-5', props.className)} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className={cn('mb-3 list-decimal space-y-1 pl-5', props.className)}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      {...props}
      className={cn('leading-7 text-[color:var(--body-strong)]', props.className)}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      {...props}
      className={cn('font-semibold text-[color:var(--ink)]', props.className)}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className={cn(
        'rounded-md bg-[color:var(--canvas-soft)] px-1.5 py-0.5 font-mono text-[0.9em] text-[color:var(--ink)]',
        props.className,
      )}
    />
  ),
  InlineFormula,
  BlockFormula,
  Blank,
  Answer,
}

type MdxComponentMap = Record<string, React.ComponentType<Record<string, unknown>>>

async function compileMdx(source: string) {
  const module = await evaluate(rewriteFormulaTags(source), {
    ...runtime,
    development: false,
    baseUrl: import.meta.url,
  })

  return module.default as React.ComponentType<Record<string, unknown>>
}

export function MdxContent({
  source,
  className,
  components,
}: {
  source: string
  className?: string
  components?: MdxComponentMap
}) {
  const cachedEntry = mdxCache.get(source) ?? null
  const cachedContent =
    cachedEntry?.revision === MDX_COMPILER_REVISION ? cachedEntry.Content : null
  const [compiledEntry, setCompiledEntry] = React.useState<{
    revision: string
    source: string
    Content: React.ComponentType<Record<string, unknown>>
  } | null>(
    cachedContent
      ? { revision: MDX_COMPILER_REVISION, source, Content: cachedContent }
      : null,
  )

  React.useEffect(() => {
    let active = true

    if (cachedContent) {
      return () => {
        active = false
      }
    }

    compileMdx(source)
      .then((component) => {
        mdxCache.set(source, {
          revision: MDX_COMPILER_REVISION,
          Content: component,
        })
        if (active) {
          setCompiledEntry({
            revision: MDX_COMPILER_REVISION,
            source,
            Content: component,
          })
        }
      })
      .catch(() => {
        if (active) {
          setCompiledEntry({
            revision: MDX_COMPILER_REVISION,
            source,
            Content: () => <p>{source}</p>,
          })
        }
      })

    return () => {
      active = false
    }
  }, [cachedContent, source])

  const Content =
    cachedContent ??
    (compiledEntry?.source === source &&
    compiledEntry.revision === MDX_COMPILER_REVISION
      ? compiledEntry.Content
      : null)

  if (!Content) {
    return (
      <div className={cn('animate-pulse rounded-[1.4rem] bg-black/5 px-4 py-6', className)}>
        正在渲染内容...
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 text-[color:var(--body-strong)]', className)}>
      <Content components={components ? { ...mdxComponents, ...components } : mdxComponents} />
    </div>
  )
}
