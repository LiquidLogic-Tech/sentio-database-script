// // === Buckets ===
export const BUCKET_TABLE_NAMES = {
  BOTTLE_CREATE: "Bottle_Create" as const,
  BOTTLE_DESTROY: "Bottle_Destroy" as const,
  BOTTLE_LIQUIDATION: "Bottle_Liquidation" as const,
  BOTTLE_UPDATE: "Bottle_Update" as const,
  TOTAL_FEE_VALUE_FROM: "Total_Fee_Value_From" as const,
} as const;

// Type for all possible table names
export type TableName =
  (typeof BUCKET_TABLE_NAMES)[keyof typeof BUCKET_TABLE_NAMES];

interface TableSchemaMap {
  Bottle_Create: BucketBottleCreateSchema;
  Bottle_Destroy: BucketBottleDestroySchema;
  Bottle_Liquidation: BucketBottleLiquidationSchema;
  Bottle_Update: BucketBottleUpdateSchema;
  Total_Fee_Value_From: BucketTotalFeeValueFromSchema;
}

export type BucketTables<T extends keyof TableSchemaMap> = TableSchemaMap[T];
