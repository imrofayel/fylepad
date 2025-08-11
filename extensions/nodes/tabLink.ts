import { mergeAttributes, Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface TabLinkOptions {
  HTMLAttributes: Record<string, any>
  renderLabel: (props: { options: TabLinkOptions; node: ProseMirrorNode }) => string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tabLink: {
      setTabLink: (options: { id: string; label?: string }) => ReturnType
    }
  }
}

export const TabLink = Node.create<TabLinkOptions>({
  name: 'tabLink',

  addOptions() {
    return {
      HTMLAttributes: {},
      renderLabel({ node }) {
        return node.attrs.label || node.attrs.id
      },
    }
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-tab-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-tab-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': this.name },
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: 'tab-link',
        }
      ),
      [
        'span',
        {
          class: 'tab-link-icon',
        },
        '📄',
      ],
      [
        'span',
        {
          class: 'tab-link-label',
        },
        this.options.renderLabel({
          options: this.options,
          node,
        }),
      ],
    ]
  },

  addCommands() {
    return {
      setTabLink:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

export default TabLink
