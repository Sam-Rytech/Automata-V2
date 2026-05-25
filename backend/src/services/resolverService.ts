export async function resolveRecipient(identifier: string): Promise<any> {
  if (identifier.endsWith('.eth')) {
    return { resolved: false, error: 'ENS resolution not yet implemented' };
  }
  return { resolved: false, error: 'Phone number resolution requires MiniPay integration' };
}
