import React from 'react';

import { Header } from '~/shared/components/header/__mocks__/Header';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';

export const EditablePageLayout = ({
  pageSlug,
  headerTitle,
  children
}: {
  pageSlug: string;
  headerTitle: string;
  children: React.ReactNode;
}) => {
  const setLocale = useStore((s: any) => s.setLocale);
  const discardChanges = useStore((s: any) => s.discardChanges);
  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

  return (
    <div>
      <Header
        title={headerTitle}
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
        onLanguageChange={(lang: 'uk' |'en') => setLocale(lang)}
      />
      <div data-testid="page-content">
        {children}
      </div>
    </div>
  );
};
