import dayjs from "dayjs";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";

interface TimePickerProps {
  value: dayjs.Dayjs;
  onChange: (value: dayjs.Dayjs) => void;
  onBlur?: () => void;
}
export const TimePicker = ({ value, onChange, onBlur }: TimePickerProps) => {
  const [date, setDate] = useState(value.format("YYYY-MM-DD"));
  const [time, setTime] = useState(value.format("HH:mm"));

  // Only call onChange when values actually change
  useEffect(() => {
    const newDateTime = dayjs(`${date}T${time}`);
    if (newDateTime.isValid() && !newDateTime.isSame(value)) {
      onChange(newDateTime);
    }
  }, [date, time, onChange, value]);

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onBlur={onBlur}
        className="text-sm"
        min={dayjs().format("YYYY-MM-DD")}
      />
      <Input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={onBlur}
        className="text-sm"
        step="900"
      />
    </div>
  );
};