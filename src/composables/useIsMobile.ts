import { ref, onMounted, onUnmounted } from "vue";

/**
 * Reactive composable that tracks whether the viewport matches a mobile breakpoint.
 * Uses `matchMedia` so it responds to orientation changes and window resizing.
 *
 * @param breakpoint - CSS media query breakpoint (default: 768px)
 */
export function useIsMobile(breakpoint = 768) {
  const isMobile = ref(false);

  let mql: MediaQueryList | undefined;

  const update = (e: MediaQueryListEvent | MediaQueryList) => {
    isMobile.value = e.matches;
  };

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    isMobile.value = mql.matches;
    mql.addEventListener("change", update);
  });

  onUnmounted(() => {
    mql?.removeEventListener("change", update);
  });

  return { isMobile };
}
