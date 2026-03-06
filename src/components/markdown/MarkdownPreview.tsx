import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import type { Node, Root } from 'mdast'
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'
import { AiTranslation } from './AiTranslation'
import { AiExplanation } from './AiExplanation'
import { AiSummary } from './AiSummary'
import { AiResult } from './AiResult'

const CUSTOM_TAGS = [
  'ai-translation',
  'ai-explanation',
  'ai-summary',
  'result',
] as const
export type CustomTagName = (typeof CUSTOM_TAGS)[number]

function isCustomTagName(name: string): name is CustomTagName {
  return (CUSTOM_TAGS as readonly string[]).includes(name)
}

function remarkMyDirectives() {
  return (tree: Root) => {
    visit(tree, (node: Node) => {
      if (node.type === 'containerDirective' || node.type === 'leafDirective') {
        const directive = node as ContainerDirective | LeafDirective

        if (!isCustomTagName(directive.name)) {
          return
        }
        const data = directive.data || (directive.data = {})
        data.hName = directive.name
      }
    })
  }
}

interface MarkdownPreviewProps {
  content: string
  onApplyAI: (
    aiText: string,
    originalSource: string,
    tagName: CustomTagName,
  ) => void
}

export function MarkdownPreview({ content, onApplyAI }: MarkdownPreviewProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkDirective, remarkMyDirectives]}
      components={
        {
          'ai-translation': (props: any) => (
            <AiTranslation
              {...props}
              onApply={(aiText, source) =>
                onApplyAI(aiText, source, 'ai-translation')
              }
            />
          ),
          'ai-explanation': (props: any) => (
            <AiExplanation
              {...props}
              onApply={(aiText, source) =>
                onApplyAI(aiText, source, 'ai-explanation')
              }
            />
          ),
          'ai-summary': (props: any) => (
            <AiSummary
              {...props}
              onApply={(aiText, source) =>
                onApplyAI(aiText, source, 'ai-summary')
              }
            />
          ),
          result: AiResult,
        } as Components
      }
    >
      {content}
    </ReactMarkdown>
  )
}
