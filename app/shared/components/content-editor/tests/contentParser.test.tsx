import { render } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { contentToHTML, contentToPlainText, parseContent } from '../editor/contentParser';

describe('contentParser', () => {
  describe('parseContent', () => {
    it('should return null for null content', () => {
      const result = parseContent(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined content', () => {
      const result = parseContent(undefined);
      expect(result).toBeNull();
    });

    it('should return null for content without content array', () => {
      const result = parseContent({ type: 'doc' } as JSONContent);
      expect(result).toBeNull();
    });

    it('should parse simple text node', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.textContent).toBe('Hello World');
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('should parse bold text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bold text',
                marks: [{ type: 'bold' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.textContent).toBe('Bold text');
    });

    it('should parse italic text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Italic text',
                marks: [{ type: 'italic' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.textContent).toBe('Italic text');
    });

    it('should parse underlined text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Underlined text',
                marks: [{ type: 'underline' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('u')).toBeInTheDocument();
      expect(container.textContent).toBe('Underlined text');
    });

    it('should parse strikethrough text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Strike text',
                marks: [{ type: 'strike' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('s')).toBeInTheDocument();
      expect(container.textContent).toBe('Strike text');
    });

    it('should parse code text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'code snippet',
                marks: [{ type: 'code' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('code')).toBeInTheDocument();
      expect(container.textContent).toBe('code snippet');
    });

    it('should parse links', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Click here',
                marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link?.textContent).toBe('Click here');
    });

    it('should parse multiple marks on same text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bold and italic',
                marks: [{ type: 'bold' }, { type: 'italic' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.textContent).toBe('Bold and italic');
    });

    it('should parse headings', () => {
      const levels = [1, 2, 3, 4, 5, 6];

      levels.forEach((level) => {
        const content: JSONContent = {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level },
              content: [{ type: 'text', text: `Heading ${level}` }]
            }
          ]
        };

        const result = parseContent(content);
        const { container } = render(<>{result}</>);

        expect(container.querySelector(`h${level}`)).toBeInTheDocument();
        expect(container.textContent).toBe(`Heading ${level}`);
      });
    });

    it('should parse blockquote', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Quote text' }]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('blockquote')).toBeInTheDocument();
      expect(container.textContent).toBe('Quote text');
    });

    it('should parse code block', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            content: [{ type: 'text', text: 'const x = 10;' }]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
      expect(container.textContent).toBe('const x = 10;');
    });

    it('should parse bullet list', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item 1' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item 2' }]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('ul')).toBeInTheDocument();
      expect(container.querySelectorAll('li')).toHaveLength(2);
      expect(container.textContent).toContain('Item 1');
      expect(container.textContent).toContain('Item 2');
    });

    it('should parse ordered list', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'First' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Second' }]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('ol')).toBeInTheDocument();
      expect(container.querySelectorAll('li')).toHaveLength(2);
      expect(container.textContent).toContain('First');
      expect(container.textContent).toContain('Second');
    });

    it('should parse image', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {
              src: 'https://example.com/image.png',
              alt: 'Example image',
              title: 'Image title'
            }
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
      expect(img).toHaveAttribute('alt', 'Example image');
      expect(img).toHaveAttribute('title', 'Image title');
    });

    it('should parse hard break', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 1' }, { type: 'hardBreak' }, { type: 'text', text: 'Line 2' }]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('br')).toBeInTheDocument();
      expect(container.textContent).toContain('Line 1');
      expect(container.textContent).toContain('Line 2');
    });

    it('should parse horizontal rule', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'horizontalRule' }]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('should handle unknown node types gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'unknownType' as any,
            content: [{ type: 'text', text: 'Unknown content' }]
          }
        ]
      };

      const result = parseContent(content);
      const { container } = render(<>{result}</>);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown node type: unknownType');
      expect(container.textContent).toContain('Unknown content');

      consoleSpy.mockRestore();
    });
  });

  describe('contentToHTML', () => {
    it('should return empty string for null content', () => {
      expect(contentToHTML(null)).toBe('');
    });

    it('should return empty string for undefined content', () => {
      expect(contentToHTML(undefined)).toBe('');
    });

    it('should return empty string for content without content array', () => {
      expect(contentToHTML({ type: 'doc' } as JSONContent)).toBe('');
    });

    it('should convert simple paragraph to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }]
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<p>Hello World</p>');
    });

    it('should convert bold text to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bold',
                marks: [{ type: 'bold' }]
              }
            ]
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<p><strong>Bold</strong></p>');
    });

    it('should convert links to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Link',
                marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
              }
            ]
          }
        ]
      };

      expect(contentToHTML(content)).toBe(
        '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a></p>'
      );
    });

    it('should convert headings to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Heading 2' }]
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<h2>Heading 2</h2>');
    });

    it('should convert bullet list to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item' }]
                  }
                ]
              }
            ]
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<ul><li><p>Item</p></li></ul>');
    });

    it('should convert image to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: 'image.png', alt: 'Alt text' }
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<img src="image.png" alt="Alt text" />');
    });

    it('should convert horizontal rule to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'horizontalRule' }]
      };

      expect(contentToHTML(content)).toBe('<hr />');
    });

    it('should convert multiple paragraphs to HTML', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Paragraph 1' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Paragraph 2' }]
          }
        ]
      };

      expect(contentToHTML(content)).toBe('<p>Paragraph 1</p><p>Paragraph 2</p>');
    });
  });

  describe('contentToPlainText', () => {
    it('should return empty string for null content', () => {
      expect(contentToPlainText(null)).toBe('');
    });

    it('should return empty string for undefined content', () => {
      expect(contentToPlainText(undefined)).toBe('');
    });

    it('should return empty string for content without content array', () => {
      expect(contentToPlainText({ type: 'doc' } as JSONContent)).toBe('');
    });

    it('should extract plain text from paragraph', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('Hello World');
    });

    it('should extract text ignoring formatting', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bold text',
                marks: [{ type: 'bold' }]
              }
            ]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('Bold text');
    });

    it('should extract text from multiple paragraphs with newlines', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'First' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Second' }]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('First\nSecond');
    });

    it('should extract text from headings', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('Title');
    });

    it('should extract text from lists', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item' }]
                  }
                ]
              }
            ]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('Item');
    });

    it('should ignore images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: 'image.png', alt: 'Alt text' }
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('');
    });

    it('should extract text from nested content', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Quoted text' }]
              }
            ]
          }
        ]
      };

      expect(contentToPlainText(content)).toBe('Quoted text');
    });
  });
});
