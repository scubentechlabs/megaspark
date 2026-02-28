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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity: string
          logged_out_by: string | null
          login_time: string
          logout_time: string | null
          updated_at: string
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          logged_out_by?: string | null
          login_time?: string
          logout_time?: string | null
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          logged_out_by?: string | null
          login_time?: string
          logout_time?: string | null
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      exam_dates: {
        Row: {
          created_at: string
          day_name: string | null
          exam_date: string
          exam_time: string | null
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_name?: string | null
          exam_date: string
          exam_time?: string | null
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_name?: string | null
          exam_date?: string
          exam_time?: string | null
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          phone_number: string | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          phone_number?: string | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          phone_number?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          coupon_code: string | null
          created_at: string
          discount_amount: number | null
          failure_reason: string | null
          id: string
          order_id: string | null
          original_amount: number | null
          payment_method: string | null
          payment_type: string
          registration_id: string | null
          registration_number: string | null
          status: string
          student_name: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          order_id?: string | null
          original_amount?: number | null
          payment_method?: string | null
          payment_type: string
          registration_id?: string | null
          registration_number?: string | null
          status: string
          student_name: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          order_id?: string | null
          original_amount?: number | null
          payment_method?: string | null
          payment_type?: string
          registration_id?: string | null
          registration_number?: string | null
          status?: string
          student_name?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          address: string | null
          building_name: string | null
          city: string | null
          class_rank: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          exam_center: string
          exam_date: string | null
          exam_pattern: string | null
          floor: string | null
          gender: string | null
          hall_ticket_url: string | null
          id: string
          marksheet_url: string | null
          medium: string | null
          mobile_number: string
          olympiad_appeared: string | null
          olympiad_certificate_url: string | null
          parent_email: string | null
          parent_first_name: string | null
          parent_last_name: string | null
          parent_name: string | null
          parent_phone: string | null
          preferred_exam_date: string | null
          previous_year_percentage: string | null
          registration_number: string | null
          room_no: string | null
          school_address: string | null
          school_medium: string | null
          school_name: string | null
          standard: string
          state: string | null
          status: string
          student_name: string
          time_slot: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          building_name?: string | null
          city?: string | null
          class_rank?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          exam_center: string
          exam_date?: string | null
          exam_pattern?: string | null
          floor?: string | null
          gender?: string | null
          hall_ticket_url?: string | null
          id?: string
          marksheet_url?: string | null
          medium?: string | null
          mobile_number: string
          olympiad_appeared?: string | null
          olympiad_certificate_url?: string | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          preferred_exam_date?: string | null
          previous_year_percentage?: string | null
          registration_number?: string | null
          room_no?: string | null
          school_address?: string | null
          school_medium?: string | null
          school_name?: string | null
          standard: string
          state?: string | null
          status?: string
          student_name: string
          time_slot?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          building_name?: string | null
          city?: string | null
          class_rank?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          exam_center?: string
          exam_date?: string | null
          exam_pattern?: string | null
          floor?: string | null
          gender?: string | null
          hall_ticket_url?: string | null
          id?: string
          marksheet_url?: string | null
          medium?: string | null
          mobile_number?: string
          olympiad_appeared?: string | null
          olympiad_certificate_url?: string | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          preferred_exam_date?: string | null
          previous_year_percentage?: string | null
          registration_number?: string | null
          room_no?: string | null
          school_address?: string | null
          school_medium?: string | null
          school_name?: string | null
          standard?: string
          state?: string | null
          status?: string
          student_name?: string
          time_slot?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          contact_email: string
          contact_phone: string
          created_at: string
          exam_name: string
          id: string
          maintenance_mode: boolean | null
          organization_name: string
          updated_at: string
        }
        Insert: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          exam_name?: string
          id?: string
          maintenance_mode?: boolean | null
          organization_name?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          exam_name?: string
          id?: string
          maintenance_mode?: boolean | null
          organization_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      slot_date_settings: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          is_enabled: boolean
          slot_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          id?: string
          is_enabled?: boolean
          slot_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          is_enabled?: boolean
          slot_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      slot_settings: {
        Row: {
          created_at: string
          current_count: number
          id: string
          is_enabled: boolean
          max_capacity: number
          reporting_time: string
          slot_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          id?: string
          is_enabled?: boolean
          max_capacity?: number
          reporting_time: string
          slot_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_count?: number
          id?: string
          is_enabled?: boolean
          max_capacity?: number
          reporting_time?: string
          slot_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          certificate_downloaded: boolean | null
          certificate_downloaded_at: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          link_opened: boolean | null
          link_opened_at: string | null
          message_type: string
          phone_number: string
          registration_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          certificate_downloaded?: boolean | null
          certificate_downloaded_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          link_opened?: boolean | null
          link_opened_at?: string | null
          message_type: string
          phone_number: string
          registration_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          certificate_downloaded?: boolean | null
          certificate_downloaded_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          link_opened?: boolean | null
          link_opened_at?: string | null
          message_type?: string
          phone_number?: string
          registration_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
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
    Enums: {
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
