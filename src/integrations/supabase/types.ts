export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          currency: string
          current_balance: number
          id: string
          is_archived: boolean
          name: string
          notes: string | null
          starting_balance: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          is_archived?: boolean
          name: string
          notes?: string | null
          starting_balance?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          is_archived?: boolean
          name?: string
          notes?: string | null
          starting_balance?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          acquisition_date: string | null
          acquisition_value: number
          category: string | null
          created_at: string
          currency: string
          current_value: number
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_value?: number
          category?: string | null
          created_at?: string
          currency?: string
          current_value?: number
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          acquisition_date?: string | null
          acquisition_value?: number
          category?: string | null
          created_at?: string
          currency?: string
          current_value?: number
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          period_start: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          rollover_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["budget_period_type"]
          rollover_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["budget_period_type"]
          rollover_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_default: boolean
          name: string
          parent_category_id: string | null
          type: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          parent_category_id?: string | null
          type?: Database["public"]["Enums"]["category_type"]
          user_id?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          parent_category_id?: string | null
          type?: Database["public"]["Enums"]["category_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          minor_unit_digits: number
          name: string
          symbol: string
        }
        Insert: {
          code: string
          minor_unit_digits?: number
          name: string
          symbol: string
        }
        Update: {
          code?: string
          minor_unit_digits?: number
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          notes: string | null
          occurred_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          counterparty_name: string
          created_at: string
          currency: string
          direction: Database["public"]["Enums"]["debt_direction"]
          due_date: string | null
          id: string
          interest_rate: number | null
          notes: string | null
          principal_amount: number
          remaining_amount: number
          status: Database["public"]["Enums"]["debt_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          counterparty_name: string
          created_at?: string
          currency?: string
          direction?: Database["public"]["Enums"]["debt_direction"]
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          principal_amount: number
          remaining_amount?: number
          status?: Database["public"]["Enums"]["debt_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          counterparty_name?: string
          created_at?: string
          currency?: string
          direction?: Database["public"]["Enums"]["debt_direction"]
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          principal_amount?: number
          remaining_amount?: number
          status?: Database["public"]["Enums"]["debt_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string
          effective_date: string
          from_currency: string
          id: string
          rate: number
          to_currency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          user_id?: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_insights: {
        Row: {
          generated_at: string
          id: string
          is_dismissed: boolean
          message: string
          severity: Database["public"]["Enums"]["insight_severity"]
          type: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          is_dismissed?: boolean
          message: string
          severity?: Database["public"]["Enums"]["insight_severity"]
          type: string
          user_id?: string
        }
        Update: {
          generated_at?: string
          id?: string
          is_dismissed?: boolean
          message?: string
          severity?: Database["public"]["Enums"]["insight_severity"]
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_accounts: {
        Row: {
          account_id: string
          created_at: string
          holding_summary_note: string | null
          id: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          holding_summary_note?: string | null
          id?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          holding_summary_note?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          created_at: string
          id: string
          last_used_category_id: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_category_id?: string | null
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_category_id?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_last_used_category_id_fkey"
            columns: ["last_used_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_snapshots: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          net_worth: number
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          related_entity_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_entity_id?: string | null
          title: string
          type: string
          user_id?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_entity_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_insights_enabled: boolean
          base_currency: string
          created_at: string
          demo_data_seeded: boolean
          display_name: string | null
          id: string
          locale: string
          onboarded: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          ai_insights_enabled?: boolean
          base_currency?: string
          created_at?: string
          demo_data_seeded?: boolean
          display_name?: string | null
          id: string
          locale?: string
          onboarded?: boolean
          theme?: string
          updated_at?: string
        }
        Update: {
          ai_insights_enabled?: boolean
          base_currency?: string
          created_at?: string
          demo_data_seeded?: boolean
          display_name?: string | null
          id?: string
          locale?: string
          onboarded?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_occurrences: {
        Row: {
          created_at: string
          expected_date: string
          id: string
          linked_transaction_id: string | null
          recurring_id: string
          status: Database["public"]["Enums"]["occurrence_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_date: string
          id?: string
          linked_transaction_id?: string | null
          recurring_id: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          expected_date?: string
          id?: string
          linked_transaction_id?: string | null
          recurring_id?: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_occurrences_linked_transaction_id_fkey"
            columns: ["linked_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_occurrences_recurring_id_fkey"
            columns: ["recurring_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          custom_interval_days: number | null
          frequency: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          last_generated_occurrence_id: string | null
          name: string
          next_occurrence_date: string
          notes: string | null
          status: Database["public"]["Enums"]["recurring_status"]
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          custom_interval_days?: number | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          last_generated_occurrence_id?: string | null
          name: string
          next_occurrence_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["recurring_status"]
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          custom_interval_days?: number | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          last_generated_occurrence_id?: string | null
          name?: string
          next_occurrence_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["recurring_status"]
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_last_generated_occurrence_id_fkey"
            columns: ["last_generated_occurrence_id"]
            isOneToOne: false
            referencedRelation: "recurring_occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_contributions: {
        Row: {
          amount: number
          created_at: string
          direction: Database["public"]["Enums"]["contribution_direction"]
          goal_id: string
          id: string
          notes: string | null
          occurred_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          direction?: Database["public"]["Enums"]["contribution_direction"]
          goal_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["contribution_direction"]
          goal_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          currency: string
          current_amount: number
          id: string
          is_archived: boolean
          name: string
          priority: number
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_amount?: number
          id?: string
          is_archived?: boolean
          name: string
          priority?: number
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_amount?: number
          id?: string
          is_archived?: boolean
          name?: string
          priority?: number
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          id: string
          is_recurring_instance: boolean
          merchant_id: string | null
          notes: string | null
          occurred_at: string
          payment_method: string | null
          recurring_id: string | null
          tags: string[]
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_recurring_instance?: boolean
          merchant_id?: string | null
          notes?: string | null
          occurred_at?: string
          payment_method?: string | null
          recurring_id?: string | null
          tags?: string[]
          type: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_recurring_instance?: boolean
          merchant_id?: string | null
          notes?: string | null
          occurred_at?: string
          payment_method?: string | null
          recurring_id?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recurring_id_fkey"
            columns: ["recurring_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount_from: number
          amount_to: number
          created_at: string
          currency_from: string
          currency_to: string
          exchange_rate_used: number
          from_account_id: string
          id: string
          notes: string | null
          occurred_at: string
          to_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_from: number
          amount_to: number
          created_at?: string
          currency_from: string
          currency_to: string
          exchange_rate_used?: number
          from_account_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          to_account_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount_from?: number
          amount_to?: number
          created_at?: string
          currency_from?: string
          currency_to?: string
          exchange_rate_used?: number
          from_account_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          to_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_insights_enabled: boolean
          created_at: string
          language: string
          notification_prefs: Json
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights_enabled?: boolean
          created_at?: string
          language?: string
          notification_prefs?: Json
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights_enabled?: boolean
          created_at?: string
          language?: string
          notification_prefs?: Json
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_default_categories: { Args: never; Returns: undefined }
      delete_my_data: { Args: never; Returns: undefined }
      recalc_account_balance: {
        Args: { p_account_id: string }
        Returns: undefined
      }
      recalc_debt: { Args: { p_debt_id: string }; Returns: undefined }
      recalc_goal: { Args: { p_goal_id: string }; Returns: undefined }
      reset_demo_data: { Args: never; Returns: undefined }
      seed_demo_data: { Args: never; Returns: undefined }
      take_net_worth_snapshot: {
        Args: never
        Returns: {
          base_currency: string
          created_at: string
          id: string
          net_worth: number
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "net_worth_snapshots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_type:
        | "cash"
        | "bank"
        | "savings"
        | "e-wallet"
        | "investment"
        | "custom"
      budget_period_type: "monthly" | "weekly" | "custom"
      category_type: "income" | "expense"
      contribution_direction: "contribution" | "withdrawal"
      debt_direction: "owed_by_me" | "owed_to_me"
      debt_status: "open" | "partially_paid" | "settled" | "overdue"
      insight_severity: "info" | "warning" | "critical"
      occurrence_status: "pending" | "confirmed" | "overdue" | "skipped"
      recurrence_frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
      recurring_status: "active" | "paused"
      tx_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: [
        "cash",
        "bank",
        "savings",
        "e-wallet",
        "investment",
        "custom",
      ],
      budget_period_type: ["monthly", "weekly", "custom"],
      category_type: ["income", "expense"],
      contribution_direction: ["contribution", "withdrawal"],
      debt_direction: ["owed_by_me", "owed_to_me"],
      debt_status: ["open", "partially_paid", "settled", "overdue"],
      insight_severity: ["info", "warning", "critical"],
      occurrence_status: ["pending", "confirmed", "overdue", "skipped"],
      recurrence_frequency: ["daily", "weekly", "monthly", "yearly", "custom"],
      recurring_status: ["active", "paused"],
      tx_type: ["income", "expense"],
    },
  },
} as const
