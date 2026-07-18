import type { LocalizedJSON } from '~/types/common';

export type WhatWeDoItem = {
  title: LocalizedJSON;
  description: LocalizedJSON;
};

export type WhatWeDolItemWithId = {
  id: string;
} & WhatWeDoItem;

export type WhatWeDoBlock = {
  title: LocalizedJSON;
  items: WhatWeDolItemWithId[];
  hidden?: boolean;
};
