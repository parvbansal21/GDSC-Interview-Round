export const getLastNDaysKeys = (days: number) => {
  const keys: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i += 1) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(getDateKey(d));
  }

  return keys;
};
