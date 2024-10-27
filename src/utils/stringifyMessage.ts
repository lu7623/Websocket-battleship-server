export const stringifyMessage = (payload: Record<string, unknown>) => {
  const message = JSON.stringify({
    ...payload,
    data: JSON.stringify(payload?.data || {}),
    id: 0,
  });

  return message;
};
