type PoolType = "BUCKET" | "PIPE" | "PSM";

type PoolHeader = {
  name: string;
  poolId: string;
  poolType: PoolType;
  outputVolumeDfId: string | null;
  interestRate: number;
};

type PoolInfo = {
  symbol: string;
  tokenAddress: string;
  balance: number;
  decimal: number;
};

type TokenInfo = {
  symbol: string;
  decimal: number;
  address: string;
};

type SentioBottleCreated = {
  address: string;
  block_number: number;
  bottle_id: string;
  buck_amount: number;
  chain: string;
  collateral_amount: number;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  log_index: number;
  message: string;
  sender: string;
  severity: string;
  timestamp: string;
  transaction_hash: string;
  transaction_index: number;
};

type SentioBottleUpdated = {
  address: string;
  block_number: string;
  bottle_id: string;
  buck_amount: number;
  buck_change_amount: number;
  buck_change_amount_usd: number;
  chain: string;
  collateral_amount: number;
  collateral_change_amount: number;
  collateral_change_usd: number;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  log_index: number;
  message: string;
  sender: string;
  severity: string;
  timestamp: string;
  transaction_hash: string;
  transaction_index: number;
};

type SentioBottleDestroyed = {
  address: string;
  block_number: string;
  bottle_id: string;
  buck_amount: number;
  chain: string;
  collateral_amount: number;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  log_index: number;
  message: string;
  sender: string;
  severity: string;
  timestamp: string;
  transaction_hash: string;
  transaction_index: number;
};

type SentioLiquidation = {
  address: string;
  amount: number;
  amount_usd: number;
  block_number: number;
  chain: string;
  chain_id: number;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  liquidator_address: string;
  log_index: number;
  message: string;
  pool_address: string;
  amount: number;
  amount_usd: number;
  block_number: number;
  chain: string;
  chain_id: number;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  liquidator_address: string;
  log_index: number;
  message: string;
  pool_address: string;
  profit_usd: number;
  severity: string;
  timestamp: string;
  token_address: string;
  transaction_hash: string;
  transaction_index: number;
  user_address: string;
};

type SentioTotalFeeValueFrom = {
  address: string;
  block_number: number;
  chain: string;
  coin_symbol: string;
  contract: string;
  distinct_event_id: string;
  distinct_id: string;
  event_name: string;
  from: string;
  log_index: number;
  message: string;
  sender: string;
  severity: string;
  timestamp: string;
  transaction_hash: string;
  transaction_index: number;
  value: number;
};
