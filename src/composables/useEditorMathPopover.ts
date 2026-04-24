import type { Editor } from "@tiptap/vue-3";
import { ref } from "vue";

type MathKind = "inline" | "block";

type MathNode = {
  attrs?: {
    latex?: string;
  };
};

export function useEditorMathPopover() {
  const mathPopoverOpen = ref(false);
  const mathLatex = ref("");
  const mathPos = ref<number | null>(null);
  const mathKind = ref<MathKind>("block");

  const openMathPopover = (node: MathNode, pos: number, kind: MathKind) => {
    mathLatex.value = node.attrs?.latex || "";
    mathPos.value = pos;
    mathKind.value = kind;
    mathPopoverOpen.value = true;
  };

  const closeMathPopover = () => {
    mathPopoverOpen.value = false;
  };

  const getMathReference = (editor: Editor) => {
    if (mathPos.value === null) {
      return undefined;
    }

    const dom = editor.view.nodeDOM(mathPos.value);
    return dom instanceof HTMLElement ? dom : undefined;
  };

  const applyMathUpdate = (editor: Editor) => {
    const pos = mathPos.value;
    const latex = mathLatex.value.trim();

    if (pos === null || !latex) {
      return;
    }

    const chain = editor.chain().focus().setNodeSelection(pos);
    if (mathKind.value === "block") {
      chain.updateBlockMath({ latex, pos }).run();
    } else {
      chain.updateInlineMath({ latex, pos }).run();
    }

    closeMathPopover();
  };

  return {
    mathPopoverOpen,
    mathLatex,
    openMathPopover,
    getMathReference,
    applyMathUpdate,
  };
}
