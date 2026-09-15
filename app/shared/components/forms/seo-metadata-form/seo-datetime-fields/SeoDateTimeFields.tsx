import DateTimePicker from '../seo-date-time-picker/DateTimePicker';

interface SeoDateTimeFieldsProps {
  readonly startDateTime?: string;
  readonly endDateTime?: string;
  readonly onChange: (start?: string, end?: string) => void;
  readonly forceShowErrors?: boolean;
  readonly onStartBlur?: () => void;
  readonly locale?: 'uk' | 'en';
  readonly labels?: {
    readonly startDateTime?: string;
    readonly endDateTime?: string;
  };
}

export function SeoDateTimeFields({
  startDateTime,
  endDateTime,
  onChange,
  forceShowErrors,
  onStartBlur,
  locale,
  labels
}: SeoDateTimeFieldsProps) {
  return (
    <DateTimePicker
      startDateTime={startDateTime}
      endDateTime={endDateTime}
      onChange={onChange}
      forceShowErrors={forceShowErrors}
      onStartBlur={onStartBlur}
      locale={locale}
      labels={labels}
    />
  );
}
