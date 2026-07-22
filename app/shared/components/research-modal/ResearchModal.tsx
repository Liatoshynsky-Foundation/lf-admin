'use client';

import React from 'react';
import toast from 'react-hot-toast';

import { ResearchModalView, ResearchWorkFormData } from './research-modal-view/ResearchModalView';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<ResearchWorkFormData>;
}

const ResearchModal: React.FC<ResearchModalProps> = ({ isOpen, onClose, mode = 'create', initialData }) => {
  const handleSave = async (data: ResearchWorkFormData) => {
    try {
      // eslint-disable-next-line no-console
      console.log('Saving research work:', data);

      toast.success(mode === 'create' ? 'Роботу успішно додано!' : 'Роботу успішно оновлено!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Помилка при збереженні роботи: ${errorMessage}`);
    }
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
