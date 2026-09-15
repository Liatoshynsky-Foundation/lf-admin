import { useState } from 'react';
import toast from 'react-hot-toast';

import { WORKS_BASE_PATH } from '~/constants/creativity';
import {
  OpusStatus,
  PaginatedWorksDocument,
  useDeleteOpusMutation,
  useUpdateOpusStatusMutation
} from '~/types/graphql/generated/graphql';

export function useWorksTableActions() {
  const [UpdateOpusStatus] = useUpdateOpusStatusMutation();
  const [deleteOpus] = useDeleteOpusMutation();

  const [groupToUngroup, setGroupToUngroup] = useState<string | null>(null);

  const handleError = (toastMessage: string) => {
    toast.error(toastMessage);
  };

  const handlePublishStatusChange = async (id: string, newStatus: OpusStatus) => {
    try {
      await UpdateOpusStatus({
        variables: {
          id,
          status: newStatus
        },
        update(cache, { data }) {
          if (!data?.updateOpusStatus) return;

          cache.modify({
            id: cache.identify({
              __typename: 'Opus',
              id: data.updateOpusStatus.id
            }),
            fields: {
              status() {
                return data.updateOpusStatus.status;
              }
            }
          });
        }
      });
      toast.success(newStatus === OpusStatus.Published ? 'Групу опубліковано' : 'Групу знято з публікації');
    } catch {
      handleError('Помилка при зміні статусу');
    }
  };

  const handleConfirmUngroup = async () => {
    if (!groupToUngroup) return;

    try {
      await deleteOpus({
        variables: { id: groupToUngroup },
        refetchQueries: [PaginatedWorksDocument],
        awaitRefetchQueries: true
      });
      toast.success('Групу успішно розгруповано');
      setGroupToUngroup(null);
    } catch {
      handleError('Помилка при розгрупуванні групи');
    }
  };

  const handleShareGroup = async (id: string) => {
    try {
      const shareUrl = `${window.location.origin}${WORKS_BASE_PATH}/group/${id}/edit`;

      await navigator.clipboard.writeText(shareUrl);

      toast.success('Посилання скопійовано в буфер обміну.');
    } catch {
      handleError('Не вдалося скопіювати посилання. Спробуйте ще раз.');
    }
  };

  return {
    groupToUngroup,
    setGroupToUngroup,
    handlePublishStatusChange,
    handleConfirmUngroup,
    handleShareGroup
  };
}
