import { useState } from 'react';
import toast from 'react-hot-toast';

import { WORKS_BASE_PATH } from '~/constants/creativity';
import { OpusStatus, useDeleteOpusMutation, useUpdateOpusMutation } from '~/types/graphql/generated/graphql';

export function useWorksTableActions() {
  const [updateOpus] = useUpdateOpusMutation();
  const [deleteOpus] = useDeleteOpusMutation();
  
  const [groupToUngroup, setGroupToUngroup] = useState<string | null>(null);

  const handlePublishStatusChange = async (id: string, newStatus: OpusStatus) => {
    try {
      await updateOpus({
        variables: {
          id,
          input: { status: newStatus }
        }
      });
      toast.success(newStatus === OpusStatus.Published ? 'Групу опубліковано' : 'Групу знято з публікації');
    } catch (error) {
      console.error(error);
      toast.error('Помилка при зміні статусу');
    }
  };

  const handleConfirmUngroup = async () => {
    if (!groupToUngroup) return;
    
    try {
      await deleteOpus({ 
        variables: { id: groupToUngroup },
        refetchQueries: ['AllOpuses', 'AllCompositions'] 
      });
      toast.success('Групу успішно розгруповано');
      setGroupToUngroup(null); 
    } catch (error) {
      console.error(error);
      toast.error('Помилка при розгрупуванні групи');
    }
  };

  const handleShareGroup = async (id: string) => {
    try {
      const shareUrl = `${window.location.origin}${WORKS_BASE_PATH}/group/${id}/edit`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      toast.success('Посилання скопійовано в буфер обміну.');
    } catch (error) {
      console.error('Помилка копіювання: ', error);
      toast.error('Не вдалося скопіювати посилання. Спробуйте ще раз.');
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
