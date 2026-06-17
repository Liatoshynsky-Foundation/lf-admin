import Badge from '~/shared/components/badge/Badge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipStatus = typeof BaseContentStatuses.Draft | typeof BaseContentStatuses.Published;
type StatusWithDateStatus = (typeof BaseContentStatuses)[keyof typeof BaseContentStatuses];

type StatusWithDateProps = Readonly<{
  status: StatusWithDateStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  dividerColor: string;
}>;

export function StatusWithDate({ status }: StatusWithDateProps) {
  const normalizedStatus: StatusChipStatus =
    status === BaseContentStatuses.Draft ? BaseContentStatuses.Draft : BaseContentStatuses.Published;

  return <Badge variant={normalizedStatus} />;
}
