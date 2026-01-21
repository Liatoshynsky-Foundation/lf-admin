import React from 'react';

export const MockSearchButton = ({
  value,
  onSearch,
  testId
}: {
  value: string;
  onSearch: (v: string) => void;
  testId: string;
}) => <input data-testid={testId} value={value} onChange={(e) => onSearch(e.target.value)} placeholder="Search" />;

export const MockFilterDropdown = ({
  label,
  value,
  onChange,
  testId
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
}) => (
  <select data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">{label}</option>
  </select>
);

export const MockMediaGrid = ({
  items,
  renderCard
}: {
  items: unknown[];
  renderCard: (item: unknown, index?: number) => React.ReactNode;
}) => (
  <div data-testid="mocked-media-grid" role="grid">
    {items.map((item: unknown, index: number) => (
      <div key={(item as { _id: string })._id}>{renderCard(item, index)}</div>
    ))}
  </div>
);
