import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SeoDateTimeFields } from './SeoDateTimeFields';

jest.mock('../seo-date-time-picker/DateTimePicker', () => ({
  __esModule: true,
  default: ({
    startDateTime,
    endDateTime,
    onChange,
    labels
  }: {
    startDateTime?: string;
    endDateTime?: string;
    onChange: (start?: string, end?: string) => void;
    labels?: { startDateTime?: string; endDateTime?: string };
  }) => (
    <div>
      <span data-testid="start">{startDateTime ?? ''}</span>
      <span data-testid="end">{endDateTime ?? ''}</span>
      <span data-testid="start-label">{labels?.startDateTime ?? ''}</span>
      <span data-testid="end-label">{labels?.endDateTime ?? ''}</span>
      <button onClick={() => onChange('2025-01-01T10:00:00', '2025-01-02T10:00:00')}>trigger</button>
    </div>
  )
}));

describe('SeoDateTimeFields', () => {
  test.each([
    ['startDateTime', { startDateTime: '2025-05-01T08:00:00' }, 'start', '2025-05-01T08:00:00'],
    ['endDateTime', { endDateTime: '2025-05-02T18:00:00' }, 'end', '2025-05-02T18:00:00']
  ] as const)('passes %s to DateTimePicker', (_prop, extraProps, testId, expected) => {
    render(<SeoDateTimeFields onChange={jest.fn()} {...extraProps} />);
    expect(screen.getByTestId(testId)).toHaveTextContent(expected);
  });

  it('passes labels to DateTimePicker', () => {
    render(<SeoDateTimeFields onChange={jest.fn()} labels={{ startDateTime: 'Start', endDateTime: 'End' }} />);
    expect(screen.getByTestId('start-label')).toHaveTextContent('Start');
    expect(screen.getByTestId('end-label')).toHaveTextContent('End');
  });

  it('calls onChange when DateTimePicker triggers change', () => {
    const onChange = jest.fn();
    render(<SeoDateTimeFields onChange={onChange} />);
    fireEvent.click(screen.getByText('trigger'));
    expect(onChange).toHaveBeenCalledWith('2025-01-01T10:00:00', '2025-01-02T10:00:00');
  });

  it('renders empty values and mounts when optional props are omitted', () => {
    render(<SeoDateTimeFields onChange={jest.fn()} />);
    (['start', 'end', 'start-label', 'end-label'] as const).forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveTextContent('');
    });
  });
});
