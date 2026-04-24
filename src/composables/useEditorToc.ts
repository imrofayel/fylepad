import { ref } from "vue";

export type TocAnchor = {
  id: string;
  level: number;
  itemIndex: number | string;
  textContent: string;
  isActive: boolean;
  isScrolledOver: boolean;
  dom: HTMLElement;
};

export function useEditorToc() {
  const tocAnchors = ref<TocAnchor[]>([]);

  const updateTocAnchors = (anchors: unknown[]) => {
    tocAnchors.value = anchors as TocAnchor[];
  };

  const goToTocAnchor = (anchor: TocAnchor) => {
    anchor.dom?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    tocAnchors,
    updateTocAnchors,
    goToTocAnchor,
  };
}
