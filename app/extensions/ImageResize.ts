import Image from '@tiptap/extension-image';

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      style: {
        default: 'width: 100%; height: auto; cursor: pointer;',
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
      title: {
        default: null,
      },
      loading: {
        default: null,
      },
      srcset: {
        default: null,
      },
      sizes: {
        default: null,
      },
      crossorigin: {
        default: null,
      },
      usemap: {
        default: null,
      },
      ismap: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      referrerpolicy: {
        default: null,
      },
      longdesc: {
        default: null,
      },
      decoding: {
        default: null,
      },
      class: {
        default: null,
      },
      id: {
        default: null,
      },
      name: {
        default: null,
      },
      draggable: {
        default: true,
      },
      tabindex: {
        default: null,
      },
      'aria-label': {
        default: null,
      },
      'aria-labelledby': {
        default: null,
      },
      'aria-describedby': {
        default: null,
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const {
        view,
        options: { editable },
      } = editor;
      const { style } = node.attrs;
      const $wrapper = document.createElement('div');
      const $container = document.createElement('div');
      const $img = document.createElement('img');

      const dispatchNodeView = () => {
        if (typeof getPos === 'function') {
          const newAttrs = {
            ...node.attrs,
            style: `${$img.style.cssText}`,
          };
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
        }
      };

      $wrapper.setAttribute('style', `display: flex;`);
      $wrapper.appendChild($container);

      $container.setAttribute('style', `${style}`);
      $container.appendChild($img);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        $img.setAttribute(key, value);
      });

      if (!editable) return { dom: $img };

      const dotsPosition = [
        'top: -4px; left: -4px; cursor: nwse-resize;',
        'top: -4px; right: -4px; cursor: nesw-resize;',
        'bottom: -4px; left: -4px; cursor: nesw-resize;',
        'bottom: -4px; right: -4px; cursor: nwse-resize;',
      ];

      let isResizing = false;
      let startX: number, startWidth: number;

      $container.addEventListener('click', () => {
        $container.setAttribute(
          'style',
          `position: relative; border: 3px solid #6a00f5; ${style} cursor: pointer;`,
        );

        Array.from({ length: 4 }, (_, index) => {
          const $dot = document.createElement('div');
          $dot.setAttribute(
            'style',
            `background-color: transparent; position: absolute; width: 9px; height: 9px; border: 0px solid black; border-radius: 50%; ${dotsPosition[index]}`,
          );

          $dot.addEventListener('mousedown', e => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              const deltaX = index % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;

              const newWidth = startWidth + deltaX;

              $container.style.width = newWidth + 'px';

              $img.style.width = newWidth + 'px';
            };

            const onMouseUp = () => {
              if (isResizing) {
                isResizing = false;
              }
              dispatchNodeView();

              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });
          $container.appendChild($dot);
        });
      });

      document.addEventListener('click', (e: MouseEvent) => {
        const $target = e.target as HTMLElement;
        const isClickInside = $container.contains($target);

        if (!isClickInside) {
          const containerStyle = $container.getAttribute('style');
          const newStyle = containerStyle?.replace('border: 1px dashed #6C6C6C;', '');
          $container.setAttribute('style', newStyle as string);

          if ($container.childElementCount > 1) {
            for (let i = 0; i < 4; i++) {
              $container.removeChild($container.lastChild as Node);
            }
          }
        }
      });

      return {
        dom: $wrapper,
      };
    };
  },
});