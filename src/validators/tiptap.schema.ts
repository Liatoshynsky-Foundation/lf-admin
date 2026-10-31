import { z } from 'zod';

import { TipTapMarkType, TipTapNodeTypes, TipTapTableNodeTypes } from '~/types/enums/common.enums';

const BoldMarkSchema = z.object({ type: z.literal(TipTapMarkType.bold) });
const ItalicMarkSchema = z.object({ type: z.literal(TipTapMarkType.italic) });
const UnderlineMarkSchema = z.object({ type: z.literal(TipTapMarkType.underline) });

export const MarkSchema = z.discriminatedUnion('type', [BoldMarkSchema, ItalicMarkSchema, UnderlineMarkSchema]);

const TextNodeSchema = z.object({
  type: z.literal(TipTapNodeTypes.text),
  text: z.string(),
  marks: z.array(MarkSchema).optional()
});

const ParagraphNodeSchema = z.object({
  type: z.literal(TipTapNodeTypes.paragraph),
  content: z.array(TextNodeSchema).optional()
});
const tableCellContentSchema = z.array(ParagraphNodeSchema).min(1);

const tableCellSchema = z.object({
  type: z.literal(TipTapTableNodeTypes.tableCell),
  content: tableCellContentSchema
});

const tableHeaderSchema = z.object({
  type: z.literal(TipTapTableNodeTypes.tableHeader),
  content: tableCellContentSchema
});

const tableRowSchema = z.object({
  type: z.literal(TipTapTableNodeTypes.tableRow),
  content: z.array(z.union([tableCellSchema, tableHeaderSchema])).min(1)
});

const tableNodeSchema = z.object({
  type: z.literal(TipTapTableNodeTypes.table),
  content: z.array(tableRowSchema).min(1)
});

export const TipTapDocSchema = z.object({
  type: z.literal(TipTapNodeTypes.doc),
  content: z.array(z.union([ParagraphNodeSchema, tableNodeSchema])).min(1)
});
