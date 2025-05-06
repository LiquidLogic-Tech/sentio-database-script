type TokenInfo = {
  symbol: string;
  decimal: number;
  address: string;
};

// sentio
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

// Database
interface BucketBottleCreateSchema {
  bottle_id: string | null;
  buck_amount: number | null;
  coin: string | null;
  collateral_amount: number | null;
  id: string;
  sender: string | null;
  timestamp: string;
  transaction_hash: string | null;
}

interface BucketBottleDestroySchema {
  bottle_id: string;
  coin: string | null;
  collateral_amount: number | null;
  id: string;
  sender: string | null;
  timestamp: string | null;
  transaction_hash: string | null;
}

interface BucketBottleLiquidationSchema {
  bottle_id: string | null;
  coin: string | null;
  collateral_amount: number | null;
  id: string;
  liquidator_address: string | null;
  pool_address: string | null;
  profit_usd: number | null;
  timestamp: string;
  transaction_hash: string | null;
}

interface BucketBottleUpdateSchema {
  bottle_id: string | null;
  buck_amount: number | null;
  buck_change_amount: number | null;
  coin: string | null;
  collateral_amount: number | null;
  collateral_change_amount: number | null;
  id: string;
  sender: string | null;
  timestamp: string;
  transaction_hash: string | null;
}

interface BucketTotalFeeValueFromSchema {
  id: string;
  coin: string | null;
  fee_value: number | null;
  timestamp: string;
  transaction_hash: string | null;
  service: string;
}
