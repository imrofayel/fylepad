import { ListKit } from "@tiptap/extension-list";
import Mathematics from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import TableOfContents, { getHierarchicalIndexes } from "@tiptap/extension-table-of-contents";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import TextAlign from "@tiptap/extension-text-align";
import { createLowlight } from "lowlight";
import { CodeBlockCopyExtension } from "@lib/extensions/CodeBlockCopyExtension";
import { CodeBlockLowlightMermaid } from "@lib/extensions/MermaidExtension";
import { CodeBlockLowlightPlantUml } from "@lib/extensions/PlantUmlExtension";
import { CodeBlockLowlightSpotify } from "@lib/extensions/SpotifyExtension";
import { CodeBlockLowlightYouTube } from "@lib/extensions/YouTubeExtension";
import ImageUpload from "@lib/extensions/EditorImageUploadExtension";
import { TwoslashExtension } from "@lib/extensions/TwoslashExtension";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Markdown } from "tiptap-markdown";

type TipTapExtensionsOptions = {
  onTocUpdate: (anchors: unknown[]) => void;
  openMathPopover: (
    node: { attrs?: { latex?: string } },
    pos: number,
    kind: "inline" | "block",
  ) => void;
};

const lowlight = createLowlight();

export const TipTapExtensions = ({ onTocUpdate, openMathPopover }: TipTapExtensionsOptions) => [
  Markdown,
  Image.configure({
    allowBase64: true,
    resize: {
      enabled: true,
      alwaysPreserveAspectRatio: true,
    },
  }),
  ListKit,
  TableKit.configure({
    table: {
      resizable: true,
    },
  }),
  TableOfContents.configure({
    anchorTypes: ["heading"],
    getIndex: getHierarchicalIndexes,
    onUpdate: (anchors) => onTocUpdate(anchors as unknown[]),
  }),
  Mathematics.configure({
    inlineOptions: {
      onClick: (node, pos) => openMathPopover(node, pos, "inline"),
    },
    blockOptions: {
      onClick: (node, pos) => openMathPopover(node, pos, "block"),
    },
    katexOptions: {
      throwOnError: false,
    },
  }),
  CodeBlockShiki.configure({
    defaultTheme: "tokyo-night",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  }),
  TwoslashExtension,
  CodeBlockCopyExtension,
  CodeBlockLowlightMermaid.configure({
    lowlight,
    classList: "mermaid-container",
    debounce: 400,
    mermaidConfig: {
      theme: "neutral",
    },
  }),
  CodeBlockLowlightPlantUml.configure({
    lowlight,
    classList: "plantuml-container",
    debounce: 400,
  }),
  CodeBlockLowlightSpotify.configure({
    lowlight,
    classList: "spotify-container",
  }),
  CodeBlockLowlightYouTube.configure({
    lowlight,
    classList: "youtube-container",
  }),
  ImageUpload,
  Emoji.configure({
    emojis: gitHubEmojis,
    enableEmoticons: true,
  }),
  TextStyle,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Highlight.configure({
    multicolor: true,
  }),
];
