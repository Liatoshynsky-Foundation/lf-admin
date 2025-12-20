// app/dev/sidebar/page.tsx
'use client';

import { FileDetailsSidebarFile, FileInfoSidebar } from '~/shared/components/file-info-sidebar/FileInfoSidebar';

const file = {
  id: '1',
  filename: 'Борис_ Лятошинський.jpg',
  previewUrl: '/images/foundation-second.png',
  addedBy: { name: 'Ірина', avatarUrl: '' },
  addedAt: '11 вересня 2025 14:15',
  format: 'jpeg',
  size: '300 Мб',
  usageLinks: [
    { id: 'u1', label: 'Життєпис/UA/Вступна секція', href: '/ua/biography#intro' },
    { id: 'u2', label: 'Події/EN/Наша місія', href: '/en/events#our-mission' }
  ],
  description: ''
} satisfies FileDetailsSidebarFile;

export default function DevSidebarPage() {
  return <FileInfoSidebar file={file} />;
}
