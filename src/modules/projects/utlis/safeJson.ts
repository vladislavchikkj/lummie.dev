// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeJsonParse(jsonString: string): any | null {
  try {
    const cleanedString = jsonString
      .replace(/[\n\r]/g, '')
      .replace(/\u00a0/g, ' ');
    return JSON.parse(cleanedString);

  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
}
