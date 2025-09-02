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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          context: Json
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          context?: Json
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          context?: Json
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          assets: Json | null
          created_at: string | null
          id: string
          name: string
          style: Json | null
          style_rules: Json | null
          tone: string | null
          updated_at: string | null
          user_id: string
          voice: string | null
        }
        Insert: {
          assets?: Json | null
          created_at?: string | null
          id?: string
          name: string
          style?: Json | null
          style_rules?: Json | null
          tone?: string | null
          updated_at?: string | null
          user_id: string
          voice?: string | null
        }
        Update: {
          assets?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          style?: Json | null
          style_rules?: Json | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          voice?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          brand_compliance: Json | null
          brand_id: string
          created_at: string | null
          data: Json | null
          embedding: string | null
          id: string
          research_run_id: string | null
          status: string
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          brand_compliance?: Json | null
          brand_id: string
          created_at?: string | null
          data?: Json | null
          embedding?: string | null
          id?: string
          research_run_id?: string | null
          status?: string
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          brand_compliance?: Json | null
          brand_id?: string
          created_at?: string | null
          data?: Json | null
          embedding?: string | null
          id?: string
          research_run_id?: string | null
          status?: string
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_research_run_id_fkey"
            columns: ["research_run_id"]
            isOneToOne: false
            referencedRelation: "research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          body: Json
          content_id: string
          created_at: string
          id: string
          user_id: string
          version: number
        }
        Insert: {
          body: Json
          content_id: string
          created_at?: string
          id?: string
          user_id: string
          version: number
        }
        Update: {
          body?: Json
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          brand_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          ref_id: string | null
          ref_table: string | null
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          ref_id?: string | null
          ref_table?: string | null
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          ref_id?: string | null
          ref_table?: string | null
          user_id?: string
        }
        Relationships: []
      }
      provider_key_history: {
        Row: {
          id: string
          old_key_hash: string
          provider: string
          rotated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          old_key_hash: string
          provider: string
          rotated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          old_key_hash?: string
          provider?: string
          rotated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_keys: {
        Row: {
          keys: Json
          last_test_result: string | null
          last_tested_at: string | null
          provider: string | null
          scopes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          keys?: Json
          last_test_result?: string | null
          last_tested_at?: string | null
          provider?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          keys?: Json
          last_test_result?: string | null
          last_tested_at?: string | null
          provider?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_prefs: {
        Row: {
          image_mode: string | null
          text_mode: string | null
          user_id: string
          video_mode: string | null
        }
        Insert: {
          image_mode?: string | null
          text_mode?: string | null
          user_id: string
          video_mode?: string | null
        }
        Update: {
          image_mode?: string | null
          text_mode?: string | null
          user_id?: string
          video_mode?: string | null
        }
        Relationships: []
      }
      research_runs: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          inputs: Json
          outputs: Json
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_runs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          meta: Json | null
          platform: string
          publish_time: string
          retries: number
          status: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          platform: string
          publish_time: string
          retries?: number
          status?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          platform?: string
          publish_time?: string
          retries?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_quota: {
        Row: {
          count: number
          endpoint: string
          user_id: string
          window_start: string
        }
        Insert: {
          count?: number
          endpoint: string
          user_id: string
          window_start: string
        }
        Update: {
          count?: number
          endpoint?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      provider_keys_compact: {
        Row: {
          keys: Json | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
