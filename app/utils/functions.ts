import type { Extension, Mark, Node, AnyExtension } from "@tiptap/core";

export function debounce<A extends unknown[]>(delay: number, apply: (...args: A) => void) {
  let timer: number | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    // @ts-expect-error - setTimeout returns NodeJS.Timeout but timer is typed as number
    timer = setTimeout(() => apply(...args), delay);
  };
}

export function configure<O = unknown>(
  extensions: Array<AnyExtension>,
  node: Extension<O> | Node<O> | Mark<O>,
  options?: Partial<O> | boolean,
  overwrite?: Partial<O>,
) {
  if (options !== false) {
    if (typeof options === "boolean") {
      extensions.push(node.configure(overwrite));
    } else {
      extensions.push(node.configure({ ...overwrite, ...options }));
    }
  }
}
