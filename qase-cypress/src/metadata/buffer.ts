// cy.task and the metadata and results files all carry JSON, which turns a Buffer into { type: 'Buffer', data: [...] }.
export function toBuffer(value: unknown): Buffer | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const { type, data } = value as { type?: unknown, data?: unknown };
  return type === 'Buffer' && Array.isArray(data) ? Buffer.from(data as number[]) : undefined;
}

export function reviveBuffer(key: string, value: unknown): unknown {
  return key === 'content' ? toBuffer(value) ?? value : value;
}
