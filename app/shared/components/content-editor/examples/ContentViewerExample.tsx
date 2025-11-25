'use client';

import { Box, Container, Paper, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { parseContent } from '~/components/content-editor';

const sampleArticle: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Breaking News: New Technology Revolutionizes Industry' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'In a groundbreaking announcement today, ' },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'innovative researchers'
        },
        { type: 'text', text: ' have unveiled a new technology that promises to transform the way we work.' }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Key Features' }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Improved efficiency by 300%' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Reduced costs significantly' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Easy to integrate with existing systems' }]
            }
          ]
        }
      ]
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '"This is a game-changer for our industry," says CEO Jane Smith.' }]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'For more information, visit ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          text: 'our website'
        },
        { type: 'text', text: '.' }
      ]
    }
  ]
};

export default function ContentViewerExample() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4 }}>
        <Box
          sx={{
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 700,
              mb: 2
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 600,
              mt: 4,
              mb: 2
            },
            '& p': {
              fontSize: '1.125rem',
              lineHeight: 1.8,
              mb: 2
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 3,
              py: 1,
              my: 3,
              fontStyle: 'italic',
              backgroundColor: 'grey.50'
            },
            '& ul': {
              pl: 4,
              mb: 2
            },
            '& li': {
              mb: 1,
              fontSize: '1.125rem'
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}
        >
          {parseContent(sampleArticle)}
        </Box>

        <Box mt={4} pt={3} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Published on{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
