import { Editor, Range, Extension } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'

export interface TabLinkOptions {
  HTMLAttributes: Record<string, any>
  renderLabel: (props: { options: TabLinkOptions; node: ProseMirrorNode }) => string
  suggestion: Omit<SuggestionOptions, 'editor'>
}

export const TabLinkSuggestion = Extension.create<TabLinkOptions>({
  name: 'tabLinkSuggestion',

  addOptions() {
    return {
      HTMLAttributes: {},
      renderLabel({ node }) {
        return `${node.attrs.label ?? node.attrs.id}`
      },
      suggestion: {
        char: '[[',
        command: ({ editor, range, props }) => {
          // Insert a custom link node that references the tab
          const nodeAfter = editor.view.state.selection.$to.nodeAfter
          const overrideSpace = nodeAfter?.text?.startsWith(' ')

          if (overrideSpace) {
            range.to += 1
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: 'tabLink',
                attrs: {
                  id: props.id,
                  label: props.title || props.label,
                },
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run()

          window.getSelection()?.collapseToEnd()
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const type = state.schema.nodes['tabLink']
          const allow = !!$from.parent.type.contentMatch.matchType(type)

          return allow
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default TabLinkSuggestion
