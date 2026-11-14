import z from 'zod';

import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import { TipTapTableNodeTypes } from '~/types/enums/common.enums';
import { TipTapDocSchema } from '~/validators/tiptap.schema';

const REQUISITES_TABLE_COLUMNS = 2;
const MERGED_CELL_ATTRIBUTES = ['colspan', 'rowspan'] as const;

type RawTipTapNode = {
  type?: unknown;
  attrs?: Record<string, unknown>;
  content?: unknown;
};

const getChildNodes = (node: unknown): RawTipTapNode[] => {
  const content = (node as RawTipTapNode | null)?.content;
  return Array.isArray(content) ? content : [];
};

const parseJsonString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const isMergedCell = (cell: RawTipTapNode) =>
  MERGED_CELL_ATTRIBUTES.some((attribute) => {
    const value = cell.attrs?.[attribute];
    return value !== undefined && value !== null && value !== 1;
  });

const requisitesContentSchema = z
  .unknown()
  .superRefine((value, ctx) => {
    getChildNodes(parseJsonString(value)).forEach((node, nodeIndex) => {
      if (node?.type !== TipTapTableNodeTypes.table) return;

      getChildNodes(node).forEach((row, rowIndex) => {
        const rowPath = ['content', nodeIndex, 'content', rowIndex];
        const cells = getChildNodes(row);

        if (cells.length !== REQUISITES_TABLE_COLUMNS) {
          ctx.addIssue({
            code: 'custom',
            path: rowPath,
            message: PAYMENT_DETAILS_MESSAGES.tableRowCellsCount
          });
        }

        cells.forEach((cell, cellIndex) => {
          if (isMergedCell(cell)) {
            ctx.addIssue({
              code: 'custom',
              path: [...rowPath, 'content', cellIndex, 'attrs'],
              message: PAYMENT_DETAILS_MESSAGES.tableMergedCells
            });
          }
        });
      });
    });
  })
  .pipe(TipTapDocSchema);

const withUniqueTabNames = <T extends z.ZodType<{ tabs: Array<{ name: string }> }>>(schema: T) => {
  return schema.superRefine(({ tabs }, ctx) => {
    const tabNames = tabs.map((tab) => tab.name.trim().toLowerCase());

    if (new Set(tabNames).size !== tabNames.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['tabs'],
        message: PAYMENT_DETAILS_MESSAGES.tabNameDuplicate
      });
    }
  });
};
const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine((file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'), {
    message: PAYMENT_DETAILS_MESSAGES.pdfInvalidType
  });

const paymentDetailsTabFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, PAYMENT_DETAILS_MESSAGES.tabNameRequired)
    .max(40, PAYMENT_DETAILS_MESSAGES.tabNameTooLong),
  content: requisitesContentSchema
});

const paymentDetailsTabSchema = paymentDetailsTabFieldsSchema.extend({
  order: z.number().int().min(0)
});

const paymentDetailsTabUpdateSchema = paymentDetailsTabFieldsSchema.extend({
  id: z.string().trim().min(1).optional()
});

export const zPaymentDetailsSchema = withUniqueTabNames(
  z.object({
    tabs: z.array(paymentDetailsTabSchema).min(1, PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired),
    pdfFile: pdfFileSchema.nullable()
  })
);

export const zPaymentDetailsUpdateSchema = withUniqueTabNames(
  z.object({
    tabs: z.array(paymentDetailsTabUpdateSchema).min(1, PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired),
    pdfFile: pdfFileSchema.nullable()
  })
);
