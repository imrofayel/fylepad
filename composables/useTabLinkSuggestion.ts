import { VueRenderer } from '@tiptap/vue-3'
import TabLinkMenu from '~/components/ui/tabLinkMenu.vue'
import type { TabLinkItem } from '~/components/ui/tabLinkMenu.vue'

export interface TabLinkSuggestionProps {
  query: string
  items: TabLinkItem[]
  command: (item: TabLinkItem) => void
  clientRect?: (() => DOMRect | null) | null
  editor?: any
  event?: KeyboardEvent
}

// Helper function to extract text content from Tiptap JSON
const extractTextFromContent = (content: any): string => {
  if (!content) return ''
  
  let text = ''
  
  const traverse = (node: any) => {
    if (node.type === 'text' && node.text) {
      text += node.text + ' '
    } else if (node.content) {
      node.content.forEach(traverse)
    }
  }
  
  if (content.content) {
    content.content.forEach(traverse)
  }
  
  return text.trim().substring(0, 100) // Limit preview to 100 characters
}

export const createTabLinkSuggestion = (getTabs: () => any[], getCurrentTabIndex: () => number) => {
  return {
    items: ({ query }: { query: string }): TabLinkItem[] => {
      const tabs = getTabs()
      const currentTabIndex = getCurrentTabIndex()
      
      return tabs
        .map((tab, index) => ({
          id: tab.id || index.toString(),
          title: tab.title || 'Untitled',
          color: tab.color,
          preview: extractTextFromContent(tab.content),
          content: tab.content,
          index,
        }))
        .filter((item) => {
          // Filter out current tab and match query
          if (item.index === currentTabIndex) return false
          
          if (!query) return true
          
          const searchTerm = query.toLowerCase()
          return (
            item.title.toLowerCase().includes(searchTerm) ||
            (item.preview && item.preview.toLowerCase().includes(searchTerm))
          )
        })
        .slice(0, 8) // Limit to 8 results
    },

    render: () => {
      let component: VueRenderer
      let menuElement: HTMLElement | null = null

      return {
        onStart: (props: TabLinkSuggestionProps) => {
          component = new VueRenderer(TabLinkMenu, {
            props: {
              items: props.items,
              command: (item: TabLinkItem) => {
                props.command({
                  ...item,
                  label: item.title,
                } as any)
              }
            },
            editor: props.editor,
          })

          menuElement = component.element as HTMLElement
          
          if (menuElement && props.clientRect) {
            menuElement.style.position = 'absolute'
            menuElement.style.zIndex = '1000'
            document.body.appendChild(menuElement)
            
            const rect = props.clientRect()
            if (rect) {
              menuElement.style.left = `${rect.left}px`
              menuElement.style.top = `${rect.bottom + 8}px`
            }
          }
        },

        onUpdate(props: TabLinkSuggestionProps) {
          if (component) {
            component.updateProps({
              items: props.items,
              command: (item: TabLinkItem) => {
                props.command({
                  ...item,
                  label: item.title,
                } as any)
              }
            })
          }

          if (menuElement && props.clientRect) {
            const rect = props.clientRect()
            if (rect) {
              menuElement.style.left = `${rect.left}px`
              menuElement.style.top = `${rect.bottom + 8}px`
            }
          }
        },

        onKeyDown(props: TabLinkSuggestionProps) {
          if (props.event?.key === 'Escape') {
            return true
          }

          return component.ref?.onKeyDown?.(props) || false
        },

        onExit() {
          if (menuElement && document.body.contains(menuElement)) {
            document.body.removeChild(menuElement)
          }
          component?.destroy()
        },
      }
    },
  }
}
