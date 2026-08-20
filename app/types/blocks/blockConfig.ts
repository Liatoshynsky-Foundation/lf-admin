import type { ContentTypeId } from './contentTypes';

export interface BlockContentSlot {
  type: ContentTypeId;
  required?: boolean;
  repeatable?: boolean;
  label?: string;
}

export interface BlockConfig {
  allowed: BlockContentSlot[];
}
