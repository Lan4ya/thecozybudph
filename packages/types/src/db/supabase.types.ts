export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line: string
          barangay: string
          city: string
          created_at: string | null
          full_name: string
          id: string
          phone_number: string
          postal_code: string
          profile_id: string
          province: string
          region: string
        }
        Insert: {
          address_line: string
          barangay: string
          city: string
          created_at?: string | null
          full_name: string
          id?: string
          phone_number: string
          postal_code: string
          profile_id: string
          province: string
          region: string
        }
        Update: {
          address_line?: string
          barangay?: string
          city?: string
          created_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string
          postal_code?: string
          profile_id?: string
          province?: string
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          card_message: string | null
          cart_id: string
          id: string
          product_id: string
          product_variant: Json
          quantity: number
        }
        Insert: {
          card_message?: string | null
          cart_id: string
          id?: string
          product_id: string
          product_variant?: Json
          quantity: number
        }
        Update: {
          card_message?: string | null
          cart_id?: string
          id?: string
          product_id?: string
          product_variant?: Json
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          id: string
          profile_id: string
        }
        Insert: {
          id?: string
          profile_id: string
        }
        Update: {
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_profile_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_id: string
          price_cents: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_id: string
          price_cents: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_id?: string
          price_cents?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string
          cart_id: string | null
          created_at: string | null
          discount_cents: number
          id: string
          profile_id: string
          shipping_cents: number
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Insert: {
          address_id?: string
          cart_id?: string | null
          created_at?: string | null
          discount_cents?: number
          id?: string
          profile_id: string
          shipping_cents: number
          status?: string
          subtotal_cents: number
          total_cents: number
        }
        Update: {
          address_id?: string
          cart_id?: string | null
          created_at?: string | null
          discount_cents?: number
          id?: string
          profile_id?: string
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_shipping_address"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string
          id: string
          method: string | null
          order_id: string
          paid_at: string | null
          payment_id: string | null
          payment_intent_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string
          id?: string
          method?: string | null
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          payment_intent_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string
          id?: string
          method?: string | null
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_intent_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_collections: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_urls: string[]
          max_price_cents: number
          min_price_cents: number
          name: string
          options: Json
          primary_image_url: string
          product_category_id: string | null
          product_collection_id: string | null
          updated_at: string
          variants: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_urls: string[]
          max_price_cents: number
          min_price_cents: number
          name: string
          options: Json
          primary_image_url: string
          product_category_id?: string | null
          product_collection_id?: string | null
          updated_at?: string
          variants: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          max_price_cents?: number
          min_price_cents?: number
          name?: string
          options?: Json
          primary_image_url?: string
          product_category_id?: string | null
          product_collection_id?: string | null
          updated_at?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "products_product_category_id_product_categories_id_fk"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_collection_id_product_collections_id_fk"
            columns: ["product_collection_id"]
            isOneToOne: false
            referencedRelation: "product_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          email: string
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          provider: string
          provider_event_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload: Json
          provider: string
          provider_event_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_cart_item: {
        Args: {
          card_message?: string
          cart_id: string
          product_id: string
          product_variant: Json
          quantity: number
        }
        Returns: {
          card_message: string
          product_id: string
          product_variant: Json
          quantity: number
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

