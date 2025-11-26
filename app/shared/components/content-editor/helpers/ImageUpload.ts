import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import ImageResize from 'tiptap-extension-resize-image';

interface ImageUploadOptions {
  onImageUpload?: (file: File) => Promise<string>;
}

export const ImageUploadExtension = ImageResize.extend<ImageUploadOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      onImageUpload: undefined,
      inline: true,
      allowBase64: true
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-float': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-float'),
        renderHTML: (attributes) => {
          if (!attributes['data-float']) {
            return {};
          }
          return {
            'data-float': attributes['data-float'],
            style: `float: ${attributes['data-float']}; margin: 8px;`
          };
        }
      }
    };
  },

  addProseMirrorPlugins() {
    const { onImageUpload } = this.options;

    return [
      new Plugin({
        key: new PluginKey('imageUploadPlugin'),
        props: {
          handleDOMEvents: {
            drop: (view: EditorView, event: DragEvent) => {
              if (!onImageUpload) return false;

              const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0;

              if (!hasFiles) return false;

              const images = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'));

              if (images.length === 0) return false;

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY
              });

              images.forEach(async (image) => {
                try {
                  const url = await onImageUpload(image);
                  const node = schema.nodes.image.create({ src: url });

                  if (coordinates) {
                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  }
                } catch (error) {
                  console.error('Image upload failed:', error);
                }
              });

              return true;
            },

            paste: (view: EditorView, event: ClipboardEvent) => {
              if (!onImageUpload) return false;

              const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0;

              if (!hasFiles) return false;

              const images = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith('image/'));

              if (images.length === 0) return false;

              event.preventDefault();

              const { schema } = view.state;

              images.forEach(async (image) => {
                try {
                  const url = await onImageUpload(image);
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                } catch (error) {
                  console.error('Image upload failed:', error);
                }
              });

              return true;
            }
          }
        }
      })
    ];
  }
});
