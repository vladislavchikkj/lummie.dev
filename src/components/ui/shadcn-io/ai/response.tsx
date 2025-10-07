'use client'

import { cn } from '@/lib/utils'
import type { ComponentProps, HTMLAttributes } from 'react'
import { isValidElement, memo } from 'react'
import ReactMarkdown, { type Options } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock, CodeBlockCopyButton } from './code-block'
import 'katex/dist/katex.min.css'
import hardenReactMarkdown from 'harden-react-markdown'
import { processFormulas, restoreFormulas } from '@/lib/formula-processing'

function processMathFormulas(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  const { textWithPlaceholders, formulas } = processFormulas(text)
  return restoreFormulas(textWithPlaceholders, formulas)
}

function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  if (text.length < 10) {
    return text
  }

  let result = text

  const asteriskCount = (result.match(/\*/g) || []).length
  if (asteriskCount % 2 === 1) {
    result = `${result}*`
  }

  const tripleBackticks = (result.match(/```/g) || []).length
  if (tripleBackticks % 2 === 0) {
    const singleBackticks = (result.match(/`/g) || []).length
    if (singleBackticks % 2 === 1) {
      result = `${result}\``
    }
  }

  return result
}

const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown)

export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options
  children: Options['children']
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['allowedImagePrefixes']
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['allowedLinkPrefixes']
  defaultOrigin?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['defaultOrigin']
  parseIncompleteMarkdown?: boolean
  useHardenedMarkdown?: boolean
}

const components: Options['components'] = {
  ol: ({ children, className, ...props }) => (
    <ol className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li className={cn('py-1', className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ children, className, ...props }) => (
    <ul className={cn('ml-4 list-outside list-disc', className)} {...props}>
      {children}
    </ul>
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn('border-border my-6', className)} {...props} />
  ),
  strong: ({ children, className, ...props }) => (
    <span className={cn('font-semibold', className)} {...props}>
      {children}
    </span>
  ),
  a: ({ children, className, ...props }) => (
    <a
      className={cn('text-primary font-medium underline', className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ children, className, ...props }) => (
    <h1
      className={cn('mt-6 mb-2 text-3xl font-semibold', className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2
      className={cn('mt-6 mb-2 text-2xl font-semibold', className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 className={cn('mt-6 mb-2 text-xl font-semibold', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }) => (
    <h4 className={cn('mt-6 mb-2 text-lg font-semibold', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }) => (
    <h5
      className={cn('mt-6 mb-2 text-base font-semibold', className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }) => (
    <h6 className={cn('mt-6 mb-2 text-sm font-semibold', className)} {...props}>
      {children}
    </h6>
  ),
  table: ({ children, className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn('border-border w-full border-collapse border', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }) => (
    <thead className={cn('bg-muted/50', className)} {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, className, ...props }) => (
    <tbody className={cn('divide-border divide-y', className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, className, ...props }) => (
    <tr className={cn('border-border border-b', className)} {...props}>
      {children}
    </tr>
  ),
  th: ({ children, className, ...props }) => (
    <th
      className={cn('px-4 py-2 text-left text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }) => (
    <td className={cn('px-4 py-2 text-sm', className)} {...props}>
      {children}
    </td>
  ),
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      className={cn(
        'border-muted-foreground/30 text-muted-foreground my-4 border-l-4 pl-4 italic',
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line

    if (!inline) {
      return <code className={className} {...props} />
    }

    return (
      <code
        className={cn(
          'bg-muted rounded px-1.5 py-0.5 font-mono text-sm',
          className
        )}
        {...props}
      />
    )
  },
  pre: ({ node, className, children }) => {
    let language = 'javascript'

    if (typeof node?.properties?.className === 'string') {
      language = node.properties.className.replace('language-', '')
    }

    let code = ''
    if (
      isValidElement(children) &&
      children.props &&
      typeof (children.props as unknown as { children?: unknown }).children ===
        'string'
    ) {
      code = (children.props as { children?: string }).children as string
    } else if (typeof children === 'string') {
      code = children
    }

    return (
      <CodeBlock
        className={cn('my-4 h-auto', className)}
        code={code}
        language={language}
      >
        <CodeBlockCopyButton onCopy={() => {}} onError={() => {}} />
      </CodeBlock>
    )
  },
}

export const Response = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    useHardenedMarkdown = true,
    ...props
  }: ResponseProps) => {
    const mathProcessedChildren =
      typeof children === 'string' ? processMathFormulas(children) : children

    const parsedChildren =
      typeof mathProcessedChildren === 'string' && shouldParseIncompleteMarkdown
        ? parseIncompleteMarkdown(mathProcessedChildren)
        : mathProcessedChildren

    const MarkdownComponent = useHardenedMarkdown
      ? HardenedMarkdown
      : ReactMarkdown

    return (
      <div
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        {...props}
      >
        <MarkdownComponent
          allowedImagePrefixes={allowedImagePrefixes ?? ['*']}
          allowedLinkPrefixes={allowedLinkPrefixes ?? ['*']}
          components={components}
          defaultOrigin={defaultOrigin}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          {...options}
        >
          {parsedChildren}
        </MarkdownComponent>
      </div>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.children !== nextProps.children) {
      return false
    }

    return (
      prevProps.className === nextProps.className &&
      prevProps.parseIncompleteMarkdown === nextProps.parseIncompleteMarkdown &&
      prevProps.useHardenedMarkdown === nextProps.useHardenedMarkdown
    )
  }
)

Response.displayName = 'Response'
