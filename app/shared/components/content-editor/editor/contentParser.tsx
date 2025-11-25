/* eslint-disable */

import React from 'react';
import type { JSONContent } from '@tiptap/react';
import type { ContentNode } from '../types';
import { ContentNodeType } from '../types';

interface RenderNodeProps {
  node: ContentNode;
  key?: string | number;
}

const renderTextNode = (node: ContentNode, key: string | number): React.ReactNode => {
  if (!node.text) return null;

  let content: React.ReactNode = node.text;

  if (node.marks && node.marks.length > 0) {
    node.marks.forEach((mark) => {
      switch (mark.type) {
        case 'bold':
          content = <strong key={`${key}-bold`}>{content}</strong>;
          break;
        case 'italic':
          content = <em key={`${key}-italic`}>{content}</em>;
          break;
        case 'underline':
          content = <u key={`${key}-underline`}>{content}</u>;
          break;
        case 'strike':
          content = <s key={`${key}-strike`}>{content}</s>;
          break;
        case 'code':
          content = <code key={`${key}-code`}>{content}</code>;
          break;
        case 'link':
          content = (
            <a key={`${key}-link`} href={mark.attrs?.href as string} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          );
          break;
      }
    });
  }

  return <span key={key}>{content}</span>;
};

const renderChildren = (content: ContentNode[] | undefined, parentKey: string | number): React.ReactNode[] => {
  if (!content || content.length === 0) return [];

  return content.map((child, index) => {
    const key = `${parentKey}-${index}`;
    return renderNode({ node: child, key });
  });
};

const renderNode = ({ node, key = 0 }: RenderNodeProps): React.ReactNode => {
  if (node.type === ContentNodeType.TEXT) {
    return renderTextNode(node, key);
  }

  const children = renderChildren(node.content, key);

  switch (node.type) {
    case ContentNodeType.PARAGRAPH:
      return <p key={key}>{children}</p>;

    case ContentNodeType.HEADING: {
      const level = (node.attrs?.level as number) || 1;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag key={key}>{children}</Tag>;
    }

    case ContentNodeType.BLOCKQUOTE:
      return <blockquote key={key}>{children}</blockquote>;

    case ContentNodeType.CODE_BLOCK:
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );

    case ContentNodeType.BULLET_LIST:
      return <ul key={key}>{children}</ul>;

    case ContentNodeType.ORDERED_LIST:
      return <ol key={key}>{children}</ol>;

    case ContentNodeType.LIST_ITEM:
      return <li key={key}>{children}</li>;

    case ContentNodeType.IMAGE:
      return (
        <img
          key={key}
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) || ''}
          title={node.attrs?.title as string}
        />
      );

    case ContentNodeType.HARD_BREAK:
      return <br key={key} />;

    case ContentNodeType.HORIZONTAL_RULE:
      return <hr key={key} />;

    default:
      console.warn(`Unknown node type: ${node.type}`);
      return children.length > 0 ? <div key={key}>{children}</div> : null;
  }
};

export const parseContent = (content: JSONContent | null | undefined): React.ReactNode => {
  if (!content || !content.content) {
    return null;
  }

  return content.content.map((node, index) => renderNode({ node: node as ContentNode, key: index }));
};

export const contentToHTML = (content: JSONContent | null | undefined): string => {
  if (!content || !content.content) {
    return '';
  }

  const renderNodeToHTML = (node: ContentNode): string => {
    if (node.type === ContentNodeType.TEXT) {
      let text = node.text || '';

      if (node.marks && node.marks.length > 0) {
        node.marks.forEach((mark) => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'strike':
              text = `<s>${text}</s>`;
              break;
            case 'code':
              text = `<code>${text}</code>`;
              break;
            case 'link':
              text = `<a href="${mark.attrs?.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
          }
        });
      }

      return text;
    }

    const childrenHTML = node.content?.map(renderNodeToHTML).join('') || '';

    switch (node.type) {
      case ContentNodeType.PARAGRAPH:
        return `<p>${childrenHTML}</p>`;

      case ContentNodeType.HEADING: {
        const level = node.attrs?.level || 1;
        return `<h${level}>${childrenHTML}</h${level}>`;
      }

      case ContentNodeType.BLOCKQUOTE:
        return `<blockquote>${childrenHTML}</blockquote>`;

      case ContentNodeType.CODE_BLOCK:
        return `<pre><code>${childrenHTML}</code></pre>`;

      case ContentNodeType.BULLET_LIST:
        return `<ul>${childrenHTML}</ul>`;

      case ContentNodeType.ORDERED_LIST:
        return `<ol>${childrenHTML}</ol>`;

      case ContentNodeType.LIST_ITEM:
        return `<li>${childrenHTML}</li>`;

      case ContentNodeType.IMAGE:
        return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`;

      case ContentNodeType.HARD_BREAK:
        return '<br />';

      case ContentNodeType.HORIZONTAL_RULE:
        return '<hr />';

      default:
        return childrenHTML;
    }
  };

  return content.content.map((node) => renderNodeToHTML(node as ContentNode)).join('');
};

export const contentToPlainText = (content: JSONContent | null | undefined): string => {
  if (!content || !content.content) {
    return '';
  }

  const extractText = (node: ContentNode): string => {
    if (node.type === ContentNodeType.TEXT) {
      return node.text || '';
    }

    if (node.content) {
      return node.content.map(extractText).join('');
    }

    return '';
  };

  return content.content.map((node) => extractText(node as ContentNode)).join('\n');
};
