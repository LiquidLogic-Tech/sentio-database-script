export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      "Bottle Create": {
        Row: {
          bottle_id: string | null;
          buck_amount: number | null;
          coin: string | null;
          collateral_amount: number | null;
          id: string;
          sender: string | null;
          timestamp: string;
          transaction_hash: string | null;
        };
        Insert: {
          bottle_id?: string | null;
          buck_amount?: number | null;
          coin?: string | null;
          collateral_amount?: number | null;
          id: string;
          sender?: string | null;
          timestamp: string;
          transaction_hash?: string | null;
        };
        Update: {
          bottle_id?: string | null;
          buck_amount?: number | null;
          coin?: string | null;
          collateral_amount?: number | null;
          id?: string;
          sender?: string | null;
          timestamp?: string;
          transaction_hash?: string | null;
        };
        Relationships: [];
      };
      "Bottle Destroy": {
        Row: {
          bottle_id: string;
          coin: string | null;
          collateral_amount: number | null;
          id: string;
          sender: string | null;
          timestamp: string | null;
          transaction_hash: string | null;
        };
        Insert: {
          bottle_id: string;
          coin?: string | null;
          collateral_amount?: number | null;
          id: string;
          sender?: string | null;
          timestamp?: string | null;
          transaction_hash?: string | null;
        };
        Update: {
          bottle_id?: string;
          coin?: string | null;
          collateral_amount?: number | null;
          id?: string;
          sender?: string | null;
          timestamp?: string | null;
          transaction_hash?: string | null;
        };
        Relationships: [];
      };
      "Bottle Liquidation": {
        Row: {
          bottle_id: string | null;
          coin: string | null;
          collateral_amount: number | null;
          collateral_amount_usd: number | null;
          id: string;
          liquidator_address: string | null;
          pool_address: string | null;
          profit_usd: number | null;
          timestamp: string;
          transaction_hash: string | null;
        };
        Insert: {
          bottle_id?: string | null;
          coin?: string | null;
          collateral_amount?: number | null;
          collateral_amount_usd?: number | null;
          id: string;
          liquidator_address?: string | null;
          pool_address?: string | null;
          profit_usd?: number | null;
          timestamp: string;
          transaction_hash?: string | null;
        };
        Update: {
          bottle_id?: string | null;
          coin?: string | null;
          collateral_amount?: number | null;
          collateral_amount_usd?: number | null;
          id?: string;
          liquidator_address?: string | null;
          pool_address?: string | null;
          profit_usd?: number | null;
          timestamp?: string;
          transaction_hash?: string | null;
        };
        Relationships: [];
      };
      "Bottle Update": {
        Row: {
          bottle_id: string | null;
          buck_amount: number | null;
          buck_change_amount: number | null;
          buck_change_amount_usd: number | null;
          coin: string | null;
          collateral_amount: number | null;
          collateral_change_amount: number | null;
          collateral_change_usd: number | null;
          id: string;
          sender: string | null;
          timestamp: string;
          transaction_hash: string | null;
        };
        Insert: {
          bottle_id?: string | null;
          buck_amount?: number | null;
          buck_change_amount?: number | null;
          buck_change_amount_usd?: number | null;
          coin?: string | null;
          collateral_amount?: number | null;
          collateral_change_amount?: number | null;
          collateral_change_usd?: number | null;
          id: string;
          sender?: string | null;
          timestamp: string;
          transaction_hash?: string | null;
        };
        Update: {
          bottle_id?: string | null;
          buck_amount?: number | null;
          buck_change_amount?: number | null;
          buck_change_amount_usd?: number | null;
          coin?: string | null;
          collateral_amount?: number | null;
          collateral_change_amount?: number | null;
          collateral_change_usd?: number | null;
          id?: string;
          sender?: string | null;
          timestamp?: string;
          transaction_hash?: string | null;
        };
        Relationships: [];
      };
      "Total Fee Value From": {
        Row: {
          id: string;
          coin: string | null;
          fee_value: number | null;
          timestamp: string;
          transaction_hash: string | null;
          service: string;
        };
        Insert: {
          id: string;
          coin?: string | null;
          fee_value?: number | null;
          timestamp?: string;
          transaction_hash?: string | null;
          service?: string;
        };
        Update: {
          id: string;
          coin?: string | null;
          fee_value?: number | null;
          timestamp?: string;
          transaction_hash?: string | null;
          service?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
