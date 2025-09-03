'use client';
import { ReactNode, useState } from 'react';

import DiscardChangesModal from '~/shared/components/design-system/discard-changes-modal/DiscardChangesModal';
import { useBeforeRouteChange } from '~/shared/hooks/use-before-route-change/useBeforeRouteChange';
import { useStayPage } from '~/shared/hooks/use-stay-page/useStayPage';
import { useStore } from '~/store';

export default function DiscardModalProvider({ children }: { readonly children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const isChanged = useStore((state) => state.isChanged);
  const blocks = useStore((state) => state.blocks);
  const { pendingPath, confirmNavigation, cancelNavigation } = useStayPage(isChanged, blocks as any);

  const handleCancel = () => {
    cancelNavigation();
    setOpen(false);
  };
  const handleConfirm = () => {
    confirmNavigation();
    setOpen(false);
  };
  useBeforeRouteChange(() => {
    if (pendingPath) {
      setOpen(true);
    }
  });

  return (
    <>
      <DiscardChangesModal open={open} handleClose={handleCancel} handleSubmit={handleConfirm} />
      {children}
    </>
  );
}
