export function formatDate(dateStr: string): { day: string; num: string } {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
  const num = date.getDate().toString();
  return { day, num };
}