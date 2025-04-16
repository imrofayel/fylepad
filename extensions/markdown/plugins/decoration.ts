import { Data, Parent, PhrasingContent, Text } from "mdast";
import { Handle } from "mdast-util-to-markdown";
import { Processor } from "unified";
import { u } from "unist-builder";
import { visit, Visitor, VisitorResult } from "unist-util-visit";

export interface DecorationData extends Data {
  flags: string;
}

export interface Decoration extends Parent {
  type: string;
  data?: DecorationData;
  children: PhrasingContent[];
}

export function remarkDecoration(type: string, marker: string, flags?: boolean) {
  const CHARS = marker.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
  const FLAGS = flags ? `([a-z0-9]{0,2})` : `()`;
  const LOCAL_REGEXP = new RegExp(`${CHARS}${FLAGS}${CHARS}\\s*([^${CHARS}]*[^ ])\\s*${CHARS}${CHARS}`);
  const GLOBAL_REGEXP = new RegExp(`${CHARS}${FLAGS}${CHARS}\\s*([^${CHARS}]*[^ ])\\s*${CHARS}${CHARS}`, "g");

  const visitor: Visitor<Text> = (node, index, parent): VisitorResult => {
    if (!parent) {
      return;
    }

    if (!LOCAL_REGEXP.test(node.value)) {
      return;
    }

    const children: Array<Text | Decoration> = [];
    const value = node.value;
    let tempValue = "";
    let prevMatchIndex = 0;
    let prevMatchLength = 0;

    const matches = Array.from(value.matchAll(GLOBAL_REGEXP));

    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];

      const mIndex = match.index ?? 0;
      const mLength = match[0].length; // match[0] is the matched input

      // could be a text part before each matched part
      const textPartIndex = index === 0 ? 0 : prevMatchIndex + prevMatchLength;

      prevMatchIndex = mIndex;
      prevMatchLength = mLength;

      // if there is a text part before
      if (mIndex > textPartIndex) {
        const textValue = value.substring(textPartIndex, mIndex);

        const textNode = u("text", textValue) as Text;
        children.push(textNode);
      }

      children.push({
        type,
        data: {
          flags: match[1] ?? "",
        },
        children: [
          {
            type: "text",
            value: match[2] ?? "",
          },
        ],
      });

      // control for the last text node if exists after the last match
      tempValue = value.slice(mIndex + mLength);
    }

    // if there is still text after the last match
    if (tempValue) {
      const textNode = u("text", tempValue) as Text;
      children.push(textNode);
    }

    if (children.length) {
      parent.children.splice(index!, 1, ...children);
    }
  };

  const handler: Handle = (node, _parent, state, info): string => {
    // @ts-expect-error
    const exit = state.enter(type);
    const tracker = state.createTracker(info);
    let value = tracker.move(marker + (flags && node.data?.flags ? node.data.flags : "") + marker);
    value += tracker.move(state.containerPhrasing(node, {
      before: value,
      after: value,
      ...tracker.current(),
    }));
    value += tracker.move(marker + marker);
    exit();
    return value;
  };

  return function (this: Processor) {
    const data = this.data();
    (data.fromMarkdownExtensions ?? (data.fromMarkdownExtensions = [])).push({
      transforms: [(tree) => {
        visit(tree, "text", visitor);
      }],
    });
    (data.toMarkdownExtensions ?? (data.toMarkdownExtensions = [])).push({
      handlers: {
        [type]: handler,
      },
    });
  };
}
