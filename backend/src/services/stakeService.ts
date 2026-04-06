export async function buildStakeTx(args: any): Promise<{ description: string; unsignedTx: any }> {
  return {
    description: `Deposit ${args.amount} ${args.token} into ${args.protocol} on ${args.chain}`,
    unsignedTx: {
      chainId: args.chain,
      to: '0x0000000000000000000000000000000000000000',
      data: '0x',
      value: '0',
      description: `Stake on ${args.protocol}`
    },
  };
}
