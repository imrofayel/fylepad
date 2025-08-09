import { Extension, Editor } from "@tiptap/core";
import type { BlockMenuItemStorage } from "./menu";

const svg = (path: string, size = 20) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <path fill="#32302c" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" d="${path}"/>
</svg>`;

const icons = {
  h1: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="textH1" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M4.1 4.825a.625.625 0 1 0-1.25 0v10.35a.625.625 0 0 0 1.25 0V10.4h6.4v4.775a.625.625 0 0 0 1.25 0V4.825a.625.625 0 1 0-1.25 0V9.15H4.1zM17.074 8.45a.6.6 0 0 1 .073.362q.003.03.003.063v6.3a.625.625 0 1 1-1.25 0V9.802l-1.55.846a.625.625 0 1 1-.6-1.098l2.476-1.35a.625.625 0 0 1 .848.25"></path></svg>`,
  h2: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="textH2" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M3.65 4.825a.625.625 0 1 0-1.25 0v10.35a.625.625 0 0 0 1.25 0V10.4h6.4v4.775a.625.625 0 0 0 1.25 0V4.825a.625.625 0 1 0-1.25 0V9.15h-6.4zm10.104 5.164c.19-.457.722-.84 1.394-.84.89 0 1.48.627 1.48 1.238 0 .271-.104.53-.302.746l-3.837 3.585a.625.625 0 0 0 .427 1.082h4.5a.625.625 0 1 0 0-1.25H14.5l2.695-2.518.027-.028c.406-.43.657-.994.657-1.617 0-1.44-1.299-2.488-2.731-2.488-1.128 0-2.145.643-2.548 1.608a.625.625 0 0 0 1.154.482"></path></svg>`,
  h3: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="textH3" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M2.877 4.2c.346 0 .625.28.625.625V9.15h6.4V4.825a.625.625 0 0 1 1.25 0v10.35a.625.625 0 0 1-1.25 0V10.4h-6.4v4.775a.625.625 0 0 1-1.25 0V4.825c0-.345.28-.625.625-.625M14.93 9.37c-.692 0-1.183.34-1.341.671a.625.625 0 1 1-1.128-.539c.416-.87 1.422-1.382 2.47-1.382.686 0 1.33.212 1.818.584.487.373.843.932.843 1.598 0 .629-.316 1.162-.76 1.533l.024.018c.515.389.892.972.892 1.669 0 .696-.377 1.28-.892 1.668s-1.198.61-1.926.61c-1.1 0-2.143-.514-2.599-1.389a.625.625 0 0 1 1.109-.578c.187.36.728.717 1.49.717.482 0 .895-.148 1.174-.358s.394-.453.394-.67-.116-.46-.394-.67c-.28-.21-.692-.358-1.174-.358h-.461a.625.625 0 0 1 0-1.25h.357a1 1 0 0 1 .104-.01c.437 0 .81-.135 1.06-.326s.351-.41.351-.605-.101-.415-.351-.606-.623-.327-1.06-.327"></path></svg>`,
  ol: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="listNumber" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M5.088 3.026a.55.55 0 0 1 .27.474v4a.55.55 0 0 1-1.1 0V4.435l-.24.134a.55.55 0 1 1-.535-.962l1.059-.588a.55.55 0 0 1 .546.007M8.5 5.375a.625.625 0 1 0 0 1.25H16a.625.625 0 1 0 0-1.25zm0 8a.625.625 0 0 0 0 1.25H16a.625.625 0 1 0 0-1.25zM6 16.55H3.5a.55.55 0 0 1-.417-.908l1.923-2.24a.7.7 0 0 0 .166-.45.335.335 0 0 0-.266-.327l-.164-.035a.6.6 0 0 0-.245.004l-.03.007a.57.57 0 0 0-.426.44.55.55 0 1 1-1.08-.206 1.67 1.67 0 0 1 1.248-1.304l.029-.007c.24-.058.49-.061.732-.01l.164.035c.664.14 1.138.726 1.138 1.404 0 .427-.153.84-.432 1.165L4.697 15.45H6a.55.55 0 0 1 0 1.1"></path></svg>`,
  ul: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="listBullet" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M4.809 12.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M16 13.375a.625.625 0 1 1 0 1.25H8.5a.625.625 0 0 1 0-1.25zM4.809 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M16 5.375a.625.625 0 1 1 0 1.25H8.5a.625.625 0 0 1 0-1.25z"></path></svg>`,
  task: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="checklist" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M7.82 4.037a.625.625 0 0 0-1.072-.644L4.344 7.4 3.008 5.842a.625.625 0 1 0-.949.813l1.9 2.217a.625.625 0 0 0 1.01-.085zm1.928 1.992a.625.625 0 1 0 0 1.25h7.125a.625.625 0 1 0 0-1.25zm-.625 7.275c0-.345.28-.625.625-.625h7.125a.625.625 0 1 1 0 1.25H9.748a.625.625 0 0 1-.625-.625M4.534 10.68a2.625 2.625 0 1 0 0 5.249 2.625 2.625 0 0 0 0-5.25m-1.375 2.624a1.375 1.375 0 1 1 2.75 0 1.375 1.375 0 0 1-2.75 0"></path></svg>`,
  quote: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="quote" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M15.796 4.971a5.067 5.067 0 0 0-5.067 5.067v.635a4.433 4.433 0 0 0 4.433 4.433 3.164 3.164 0 1 0-3.11-3.75 3.2 3.2 0 0 1-.073-.683v-.635a3.817 3.817 0 0 1 3.817-3.817h.635a.625.625 0 1 0 0-1.25zm-9.054 0a5.067 5.067 0 0 0-5.067 5.068v.634a4.433 4.433 0 0 0 4.433 4.433 3.164 3.164 0 1 0-3.11-3.75 3.2 3.2 0 0 1-.073-.683v-.634A3.817 3.817 0 0 1 6.742 6.22h.635a.625.625 0 1 0 0-1.25z"></path></svg>`,
  code: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="code" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M12.6 3.172a.625.625 0 0 0-1.201-.344l-4 14a.625.625 0 0 0 1.202.344zM5.842 5.158a.625.625 0 0 1 0 .884L1.884 10l3.958 3.958a.625.625 0 0 1-.884.884l-4.4-4.4a.625.625 0 0 1 0-.884l4.4-4.4a.625.625 0 0 1 .884 0m8.316 0a.625.625 0 0 1 .884 0l4.4 4.4a.625.625 0 0 1 0 .884l-4.4 4.4a.625.625 0 0 1-.884-.884L18.116 10l-3.958-3.958a.625.625 0 0 1 0-.884"></path></svg>`,
  hr: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="divider" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M4 9.375a.625.625 0 1 0 0 1.25h12a.625.625 0 1 0 0-1.25z"></path></svg>`,
  table: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="viewTable" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zm11.875 7h-5.75v-2.25h5.75zm-5.75 1.25h5.75v1.375a.875.875 0 0 1-.875.875h-4.875zm-1.25-1.25h-5.75v-2.25h5.75zm-5.75 1.25h5.75v2.25H4.5a.875.875 0 0 1-.875-.875zm0-4.75V6.25c0-.483.392-.875.875-.875h4.875v2.25zm7 0v-2.25H15.5c.483 0 .875.392.875.875v1.375z"></path></svg>`,
  mermaid: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="whaleTail" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M2.052 4.126a.63.63 0 0 1 .56-.178l3.105.564A6.63 6.63 0 0 1 9.923 7.18l.077.107.077-.107a6.63 6.63 0 0 1 4.206-2.668l3.105-.564a.625.625 0 0 1 .724.742l-.625 2.998a5.64 5.64 0 0 1-4.028 4.288c-.566.155-.959.67-.959 1.257v3.33c0 .345-.28.625-.625.625h-3.75a.625.625 0 0 1-.625-.625v-3.33c0-.587-.392-1.101-.959-1.257a5.64 5.64 0 0 1-4.028-4.288L1.888 4.69a.63.63 0 0 1 .164-.564m1.25 1.217.435 2.09a4.39 4.39 0 0 0 3.135 3.338 2.55 2.55 0 0 1 1.878 2.462v2.704h2.5v-2.704c0-1.15.769-2.158 1.878-2.462a4.39 4.39 0 0 0 3.136-3.337l.435-2.09-2.193.398a5.38 5.38 0 0 0-3.412 2.164l-.585.82a.625.625 0 0 1-1.018 0l-.585-.82a5.38 5.38 0 0 0-3.412-2.164z"></path></svg>`,
  plantUML: `<svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="chartBarYAxis" style="width: 25px; height: 25px; display: block; fill: rgb(50, 48, 44); flex-shrink: 0;"><path d="M14.375 4.25c0-.621-.504-1.125-1.125-1.125h-9c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h9c.621 0 1.125-.504 1.125-1.125zm-10 .125h8.75v1.25h-8.75zm4.875 3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125zm-.125 1.25h-4.75v1.25h4.75zm6.625 3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H4.25a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125zm-.125 1.25H4.375v1.25h11.25z"></path></svg>`
};

export const BlockMenuItems = Extension.create({
  name: "blockMenuItems",
  addStorage() {
    return {
      blockMenu: {
        items: [
          {
            id: "heading1",
            name: "Heading 1",
            icon: icons.h1,
            keywords: "h1 heading title",
            shortcut: "#",
            action: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
          },
          {
            id: "heading2",
            name: "Heading 2",
            icon: icons.h2,
            keywords: "h2 heading",
            shortcut: "##",
            action: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
          },
          {
            id: "heading3",
            name: "Heading 3",
            icon: icons.h3,
            keywords: "h3 heading",
            shortcut: "###",
            action: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
          },
          {
            id: "orderedList",
            name: "Numbered List",
            icon: icons.ol,
            keywords: "list ordered numbered",
            action: (editor) => editor.chain().focus().toggleOrderedList().run(),
          },
          {
            id: "bulletList",
            name: "Bullet List",
            icon: icons.ul,
            keywords: "list bullet unordered",
            action: (editor) => editor.chain().focus().toggleBulletList().run(),
          },
          {
            id: "taskList",
            name: "Task List",
            icon: icons.task,
            keywords: "list task todo checkbox",
            action: (editor) => editor.chain().focus().toggleTaskList().run(),
          },
          {
            id: "blockquote",
            name: "Blockquote",
            icon: icons.quote,
            keywords: "quote blockquote",
            action: (editor) => editor.chain().focus().toggleBlockquote().run(),
          },
          {
            id: "codeBlock",
            name: "Code Block",
            icon: icons.code,
            keywords: "code block",
            action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
          },
          {
            id: "horizontalRule",
            name: "Divider",
            icon: icons.hr,
            keywords: "divider hr horizontal rule",
            action: (editor) => editor.chain().focus().setHorizontalRule().run(),
          },
          {
            id: "table",
            name: "Table",
            icon: icons.table,
            keywords: "table grid",
            action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          },
        {
            id: "code-mermaid",
            name: "Code — Mermaid",
            icon: icons.mermaid,
            keywords: "mermaid diagram chart",
            action: (editor) => editor.commands.setMermaid('graph TD;\n  A-->B;  A-->C;\n  B-->D;\n  C-->D;'),
          },

                  {
            id: "code-plantuml",
            name: "Code — PlantUML",
            icon: icons.plantUML,
            keywords: "plantUML diagram chart uml",
            action: (editor) => editor.commands.setPlantuml('@startuml\nBob -> Alice : hello\n@enduml'),
          }



        ],
      },
    } satisfies BlockMenuItemStorage;
  },
});

export default BlockMenuItems;
