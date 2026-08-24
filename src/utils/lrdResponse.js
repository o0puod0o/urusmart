export const getLrdRows = (payload) => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const getLrdTotal = (payload, rows = getLrdRows(payload)) => {
  const value = payload?.data ?? payload;
  const candidates = [payload?.total, payload?.meta?.total, value?.total, value?.meta?.total];
  const total = candidates.find((candidate) => Number.isFinite(Number(candidate)));
  return total === undefined ? rows.length : Number(total);
};
