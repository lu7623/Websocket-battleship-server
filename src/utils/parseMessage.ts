export const parseMessage = (message: string) => {
    const payload = JSON.parse(message);
    payload.data = JSON.parse(payload?.data || '{}'); 
    return payload;
  };