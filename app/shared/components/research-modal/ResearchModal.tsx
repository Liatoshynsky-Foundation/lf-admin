import React from 'react';
import toast from 'react-hot-toast';

import { ResearchModalView, ResearchWorkFormData } from './research-modal-view/ResearchModalView';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<ResearchWorkFormData>;
}

const ResearchModal = ({ isOpen, onClose, mode = 'create', initialData }: ResearchModalProps) => {
  const handleSave = async (data: ResearchWorkFormData) => {
    // eslint-disable-next-line no-console
    console.log('Research work data (persistence not implemented yet):', data);

    toast.error('Збереження ще не реалізовано. Дані не будуть збережені.');
  };

  return (
    <ResearchModalView
      dialogTitle={mode === 'create' ? 'Нова робота' : 'Деталі роботи'}
      isOpen={isOpen}
      initialData={initialData}
      onClose={onClose}
      onSave={handleSave}
    />
  );
};

export default ResearchModal;
