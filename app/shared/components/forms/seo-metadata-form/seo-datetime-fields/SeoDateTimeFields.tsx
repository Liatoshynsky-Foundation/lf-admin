import DateTimePicker from '../seo-date-time-picker/DateTimePicker';

interface SeoDateTimeFieldsProps {
  readonly startDateTime?: string;
  readonly endDateTime?: string;
  readonly onChange: (start?: string, end?: string) => void;
  readonly labels?: {
    readonly startDateTime?: string;
    readonly endDateTime?: string;
  };
}

export function SeoDateTimeFields({ startDateTime, endDateTime, onChange, labels }: SeoDateTimeFieldsProps) {
  return <DateTimePicker startDateTime={startDateTime} endDateTime={endDateTime} onChange={onChange} labels={labels} />;
}
