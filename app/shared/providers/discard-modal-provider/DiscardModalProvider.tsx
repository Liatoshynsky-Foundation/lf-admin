'use client';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import DiscardChangesModal from '~/shared/components/design-system/discard-changes-modal/DiscardChangesModal';
import { useStore } from '~/store';

export default function DiscardModalProvider({ children }: { readonly children: ReactNode }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  // const { pendingPath, confirmNavigation, cancelNavigation } = useStayPage();

  const pendingNavigation = useStore((state) => state.pendingNavigation);
  const isDiscardModalOpen = useStore((state) => state.isDiscardModalOpen);
  const setPendingNavigation = useStore((state) => state.setPendingNavigation);
  const setDiscardModalOpen = useStore((state) => state.setDiscardModalOpen);

  const handleCancel = () => {
    // cancelNavigation();

    setPendingNavigation(null);
    setDiscardModalOpen(false);

    setOpen(false);
  };
  const handleConfirm = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);

      setPendingNavigation(null);
      setDiscardModalOpen(false);
    } else {
      // confirmNavigation();
    }

    setOpen(false);
  };

  // useBeforeRouteChange(() => {
  //   if (pendingPath) {
  //     setOpen(true);
  //   }
  // });

  useEffect(() => {
    if (isDiscardModalOpen) {
      setOpen(true);
    }
  }, [isDiscardModalOpen]);

  return (
    <>
      <DiscardChangesModal open={open} handleClose={handleCancel} handleSubmit={handleConfirm} />
      {children}
    </>
  );
}
