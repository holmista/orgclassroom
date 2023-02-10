export default function isValidTime(time: string): boolean {
  if (time.length !== 4) return false;
  const timeInt = parseInt(time);
  if (isNaN(timeInt)) return false;
  if (timeInt < 0 || timeInt > 2400) return false;
  const hour = parseInt(time.slice(0, 2));
  const minute = parseInt(time.slice(2, 4));
  if (hour < 0 || hour > 24) return false;
  if (minute < 0 || minute > 60) return false;
  return true;
}
