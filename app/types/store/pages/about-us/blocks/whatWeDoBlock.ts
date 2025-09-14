import type { LocalizedProse, LocalizedString } from '~/types/common';

export type WhatWeDoItem = {
  title: LocalizedString;
  description: LocalizedProse;
};

export type WhatWeDolItemWithId = {
  id: string;
} & WhatWeDoItem;

export type WhatWeDoBlock = {
  title: LocalizedString;
  items: WhatWeDolItemWithId[];
};
