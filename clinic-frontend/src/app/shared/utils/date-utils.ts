export function combineDateAndTime(date: Date | null, time: string): Date | null {
  if (!date || !time) return null;
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export function toApiLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

export function defaultTimeSlot(minutesAhead = 30): string {
  const slot = new Date();
  slot.setMinutes(slot.getMinutes() + minutesAhead, 0, 0);
  return `${String(slot.getHours()).padStart(2, '0')}:${String(slot.getMinutes()).padStart(2, '0')}`;
}

export function defaultReservationDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
