export enum PageStatus {
  Draft = 'draft',
  Published = 'published'
}

export enum PageCategories {
  BorysLiatoshynsky = 'borys_liatoshynsky',
  Foundation = 'foundation',
  Cooperation = 'cooperation',
  Archive = 'archive', 
  Other = 'other'
}
export type PageCategory = PageCategories
export const PageCategory = PageCategories;


export enum BaseContentStatuses {
  Draft = 'draft',
  Published = 'published',
  Hidden = 'hidden',
  Archived = 'archived',
  Editing = 'editing'
}

export const NewsStatus = BaseContentStatuses;
export type NewsStatus = BaseContentStatuses;

export const MediaStatus = BaseContentStatuses;
export type MediaStatus = BaseContentStatuses;

export const EventStatus = BaseContentStatuses;
export type EventStatus = BaseContentStatuses;

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export enum SortByDate {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  PublishedAt = 'publishedAt',
  AdminTitle = 'adminTitle'
}