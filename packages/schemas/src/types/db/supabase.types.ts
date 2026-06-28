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
      action_cooldowns: {
        Row: {
          action_type: Database["public"]["Enums"]["cooldown_type"]
          created_at: string
          ends_at: string
          profile_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["cooldown_type"]
          created_at?: string
          ends_at: string
          profile_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["cooldown_type"]
          created_at?: string
          ends_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_cooldowns_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_line: string
          barangay: string
          city: string
          full_name: string
          id: string
          is_company_address: boolean
          is_default: boolean
          latitude: number
          longitude: number
          phone_number: string
          postal_code: string
          profile_id: string | null
          province: string | null
          region: string
        }
        Insert: {
          address_line: string
          barangay: string
          city: string
          full_name: string
          id?: string
          is_company_address?: boolean
          is_default?: boolean
          latitude: number
          longitude: number
          phone_number: string
          postal_code: string
          profile_id?: string | null
          province?: string | null
          region: string
        }
        Update: {
          address_line?: string
          barangay?: string
          city?: string
          full_name?: string
          id?: string
          is_company_address?: boolean
          is_default?: boolean
          latitude?: number
          longitude?: number
          phone_number?: string
          postal_code?: string
          profile_id?: string | null
          province?: string | null
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          card_messages: string[]
          cart_id: string | null
          created_at: string
          id: string
          is_available: boolean
          product_id: string | null
          product_variant_id: string | null
          quantity: number
        }
        Insert: {
          card_messages?: string[]
          cart_id?: string | null
          created_at?: string
          id?: string
          is_available?: boolean
          product_id?: string | null
          product_variant_id?: string | null
          quantity: number
        }
        Update: {
          card_messages?: string[]
          cart_id?: string | null
          created_at?: string
          id?: string
          is_available?: boolean
          product_id?: string | null
          product_variant_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_carts_id_fk"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_variant_id_product_variants_id_fk"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          id: string
          profile_id: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_inquiries: {
        Row: {
          admin_note: string | null
          budget: string | null
          created_at: string
          email: string
          event_date: string
          event_type: string
          guest_count: number | null
          id: string
          message: string
          name: string
          phone: string
          profile_id: string | null
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          admin_note?: string | null
          budget?: string | null
          created_at?: string
          email: string
          event_date: string
          event_type: string
          guest_count?: number | null
          id?: string
          message: string
          name: string
          phone: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          admin_note?: string | null
          budget?: string | null
          created_at?: string
          email?: string
          event_date?: string
          event_type?: string
          guest_count?: number | null
          id?: string
          message?: string
          name?: string
          phone?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_inquiries_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string | null
          error_payload: Json | null
          expires_at: string | null
          id: string
          idempotency_key: string
          operation: string
          profile_id: string
          request_hash: string
          response_payload: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_payload?: Json | null
          expires_at?: string | null
          id?: string
          idempotency_key: string
          operation: string
          profile_id: string
          request_hash: string
          response_payload?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_payload?: Json | null
          expires_at?: string | null
          id?: string
          idempotency_key?: string
          operation?: string
          profile_id?: string
          request_hash?: string
          response_payload?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      image_snapshots: {
        Row: {
          created_at: string
          hash: string
          ref_count: number
        }
        Insert: {
          created_at?: string
          hash: string
          ref_count?: number
        }
        Update: {
          created_at?: string
          hash?: string
          ref_count?: number
        }
        Relationships: []
      }
      order_address_snapshots: {
        Row: {
          address_line: string
          barangay: string
          city: string
          full_name: string
          id: string
          latitude: number
          longitude: number
          order_id: string
          phone_number: string
          postal_code: string
          province: string | null
          region: string
        }
        Insert: {
          address_line: string
          barangay: string
          city: string
          full_name: string
          id?: string
          latitude: number
          longitude: number
          order_id: string
          phone_number: string
          postal_code: string
          province?: string | null
          region: string
        }
        Update: {
          address_line?: string
          barangay?: string
          city?: string
          full_name?: string
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string
          phone_number?: string
          postal_code?: string
          province?: string | null
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_address_snapshots_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_creation_requests: {
        Row: {
          created_at: string
          id: string
          idempotency_key: string
          order_id: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          idempotency_key: string
          order_id?: string | null
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          idempotency_key?: string
          order_id?: string | null
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_creation_requests_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_creation_requests_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items_snapshots: {
        Row: {
          card_messages: string[]
          category: string
          collection: string | null
          id: string
          name: string
          order_id: string
          price_cents: number
          primary_image_url: string
          product_id: string | null
          product_variant_id: string | null
          quantity: number
          variant_attributes: Json
        }
        Insert: {
          card_messages?: string[]
          category: string
          collection?: string | null
          id?: string
          name: string
          order_id: string
          price_cents: number
          primary_image_url: string
          product_id?: string | null
          product_variant_id?: string | null
          quantity: number
          variant_attributes: Json
        }
        Update: {
          card_messages?: string[]
          category?: string
          collection?: string | null
          id?: string
          name?: string
          order_id?: string
          price_cents?: number
          primary_image_url?: string
          product_id?: string | null
          product_variant_id?: string | null
          quantity?: number
          variant_attributes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "order_items_snapshots_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_snapshots_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_snapshots_product_variant_id_product_variants_id_fk"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount_cents: number
          expires_at: string
          id: string
          pass_on_fee: number
          profile_id: string
          service_type: string
          shipping_cents: number
          source: string
          status: string
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_cents?: number
          expires_at: string
          id?: string
          pass_on_fee: number
          profile_id: string
          service_type: string
          shipping_cents: number
          source?: string
          status?: string
          subtotal_cents: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_cents?: number
          expires_at?: string
          id?: string
          pass_on_fee?: number
          profile_id?: string
          service_type?: string
          shipping_cents?: number
          source?: string
          status?: string
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string
          id: string
          method: string | null
          order_id: string
          paid_at: string | null
          payment_id: string | null
          payment_intent_id: string | null
          profile_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          method?: string | null
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          payment_intent_id?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          method?: string | null
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_intent_id?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_profile_id_profiles_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      product_variants: {
        Row: {
          attributes: Json
          id: string
          price_cents: number
          product_id: string
        }
        Insert: {
          attributes: Json
          id?: string
          price_cents?: number
          product_id: string
        }
        Update: {
          attributes?: Json
          id?: string
          price_cents?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_hashes: string[]
          image_urls: string[]
          max_price_cents: number
          min_price_cents: number
          name: string
          options: Json
          primary_image_hash: string
          primary_image_url: string
          product_category_id: string | null
          product_collection_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_hashes?: string[]
          image_urls: string[]
          max_price_cents: number
          min_price_cents: number
          name: string
          options: Json
          primary_image_hash: string
          primary_image_url: string
          product_category_id?: string | null
          product_collection_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_hashes?: string[]
          image_urls?: string[]
          max_price_cents?: number
          min_price_cents?: number
          name?: string
          options?: Json
          primary_image_hash?: string
          primary_image_url?: string
          product_category_id?: string | null
          product_collection_id?: string | null
          updated_at?: string
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
      rate_limits: {
        Row: {
          count: number
          key: string
          reset_at: number
        }
        Insert: {
          count?: number
          key: string
          reset_at: number
        }
        Update: {
          count?: number
          key?: string
          reset_at?: number
        }
        Relationships: []
      }
      shipments: {
        Row: {
          cancel_party: string | null
          cancel_reason: string | null
          created_at: string
          delivered_at: string | null
          driver_id: string | null
          driver_image_url: string | null
          driver_location: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_plate_number: string | null
          driver_share_link: string | null
          failed_at: string | null
          id: string
          lalamove_order_id: string | null
          lalamove_quotation_id: string | null
          order_id: string
          pod_image_url: string | null
          pod_status: Database["public"]["Enums"]["pod_status"] | null
          schedule_at: string | null
          share_link: string | null
          shipment_status: Database["public"]["Enums"]["shipment_status"] | null
          shipment_status_updated_at: string | null
          total_cents: number | null
          updated_at: string
        }
        Insert: {
          cancel_party?: string | null
          cancel_reason?: string | null
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          driver_image_url?: string | null
          driver_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate_number?: string | null
          driver_share_link?: string | null
          failed_at?: string | null
          id?: string
          lalamove_order_id?: string | null
          lalamove_quotation_id?: string | null
          order_id: string
          pod_image_url?: string | null
          pod_status?: Database["public"]["Enums"]["pod_status"] | null
          schedule_at?: string | null
          share_link?: string | null
          shipment_status?:
            | Database["public"]["Enums"]["shipment_status"]
            | null
          shipment_status_updated_at?: string | null
          total_cents?: number | null
          updated_at?: string
        }
        Update: {
          cancel_party?: string | null
          cancel_reason?: string | null
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          driver_image_url?: string | null
          driver_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate_number?: string | null
          driver_share_link?: string | null
          failed_at?: string | null
          id?: string
          lalamove_order_id?: string | null
          lalamove_quotation_id?: string | null
          order_id?: string
          pod_image_url?: string | null
          pod_status?: Database["public"]["Enums"]["pod_status"] | null
          schedule_at?: string | null
          share_link?: string | null
          shipment_status?:
            | Database["public"]["Enums"]["shipment_status"]
            | null
          shipment_status_updated_at?: string | null
          total_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          p_card_messages?: string[]
          p_cart_id: string
          p_product_id: string
          p_product_variant: Json
          p_quantity: number
        }
        Returns: {
          card_messages: string[]
          product_id: string
          product_variant: Json
          quantity: number
        }[]
      }
    }
    Enums: {
      cooldown_type: "otp_sms" | "email_verification" | "password_reset"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "cancelled"
        | "refunded"
      pod_status: "FAILED" | "DELIVERED" | "SIGNED"
      shipment_status:
        | "ASSIGNING_DRIVER"
        | "ON_GOING"
        | "PICKED_UP"
        | "COMPLETED"
        | "CANCELLED"
        | "REJECTED"
        | "EXPIRED"
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
    Enums: {
      cooldown_type: ["otp_sms", "email_verification", "password_reset"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      pod_status: ["FAILED", "DELIVERED", "SIGNED"],
      shipment_status: [
        "ASSIGNING_DRIVER",
        "ON_GOING",
        "PICKED_UP",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "EXPIRED",
      ],
    },
  },
} as const

