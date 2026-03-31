import DateTimePicker from '../seo-date-time-picker/DateTimePicker';

interface SeoDateTimeFieldsProps {
  startDateTime?: string;
  endDateTime?: string;
  onChange: (start?: string, end?: string) => void;
  labels?: {
    startDateTime?: string;
    endDateTime?: string;
  };
}

export function SeoDateTimeFields({ startDateTime, endDateTime, onChange, labels }: SeoDateTimeFieldsProps) {
  return <DateTimePicker startDateTime={startDateTime} endDateTime={endDateTime} onChange={onChange} labels={labels} />;
}
