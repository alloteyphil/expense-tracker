export type ParsedReceiptDraft = {
  amountMinor?: number;
  extractedDate?: number;
  extractedMerchant?: string;
};

export function parseReceiptText(text: string): ParsedReceiptDraft {
  const amountMatch = text.match(/(\d+[.,]\d{2})/);
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  const merchantMatch = text.match(
    /merchant[:\s]+([A-Za-z0-9 &.'-]+?)(?:\s+(?:amount|date)\b|$)/i,
  );
  const amountMinor = amountMatch
    ? Math.round(Number(amountMatch[1].replace(",", ".")) * 100)
    : undefined;
  const extractedDate = dateMatch
    ? new Date(`${dateMatch[1]}T00:00:00.000Z`).getTime()
    : undefined;
  return {
    amountMinor,
    extractedDate,
    extractedMerchant: merchantMatch?.[1]?.trim(),
  };
}
