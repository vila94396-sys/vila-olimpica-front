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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_gallery: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          apartment: string
          block: string
          building: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          resident_type: string
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          apartment: string
          block: string
          building: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          resident_type: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          apartment?: string
          block?: string
          building?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          resident_type?: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      common_areas: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          rules: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          rules?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rules?: string | null
        }
        Relationships: []
      }
      condominium_fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          payment_method: string | null
          receipt_url: string | null
          reference_month: string
          reference_year: number
          status: string
          unidade_id: string | null
          updated_at: string
          user_id: string
          valor_pago: number
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_month: string
          reference_year: number
          status?: string
          unidade_id?: string | null
          updated_at?: string
          user_id: string
          valor_pago?: number
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_month?: string
          reference_year?: number
          status?: string
          unidade_id?: string | null
          updated_at?: string
          user_id?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "condominium_fees_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      document_downloads: {
        Row: {
          document_id: string
          downloaded_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          document_id: string
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          document_id?: string
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_downloads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_size: string | null
          file_type: string | null
          file_url: string
          folder: string | null
          id: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: string | null
          file_type?: string | null
          file_url: string
          folder?: string | null
          id?: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          folder?: string | null
          id?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      fpd_fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          payment_method: string | null
          receipt_url: string | null
          reference_month: string
          reference_year: number
          status: string
          unidade_id: string
          updated_at: string
          valor_pago: number
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_month: string
          reference_year: number
          status?: string
          unidade_id: string
          updated_at?: string
          valor_pago?: number
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_month?: string
          reference_year?: number
          status?: string
          unidade_id?: string
          updated_at?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "fpd_fees_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "fpd_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      fpd_unidades: {
        Row: {
          apartamento: number
          contacto: string
          created_at: string
          divida_anterior: number
          divida_inicial: number
          id: string
          nome: string
          ord: number
          pagamentos_historicos: number
          taxa: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apartamento?: number
          contacto?: string
          created_at?: string
          divida_anterior?: number
          divida_inicial?: number
          id?: string
          nome: string
          ord?: number
          pagamentos_historicos?: number
          taxa?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apartamento?: number
          contacto?: string
          created_at?: string
          divida_anterior?: number
          divida_inicial?: number
          id?: string
          nome?: string
          ord?: number
          pagamentos_historicos?: number
          taxa?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      institution_fees: {
        Row: {
          created_at: string
          descricao: string
          id: string
          institution: string
          n_apartamentos: number
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          period_label: string
          receipt_url: string | null
          reference_month: number
          reference_year: number
          status: string
          taxa: number
          updated_at: string
          valor: number
          valor_pago: number
        }
        Insert: {
          created_at?: string
          descricao?: string
          id?: string
          institution: string
          n_apartamentos?: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          period_label: string
          receipt_url?: string | null
          reference_month: number
          reference_year: number
          status?: string
          taxa?: number
          updated_at?: string
          valor?: number
          valor_pago?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          institution?: string
          n_apartamentos?: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          period_label?: string
          receipt_url?: string | null
          reference_month?: number
          reference_year?: number
          status?: string
          taxa?: number
          updated_at?: string
          valor?: number
          valor_pago?: number
        }
        Relationships: []
      }
      institution_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          fee_id: string
          id: string
          institution: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          fee_id: string
          id?: string
          institution: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          fee_id?: string
          id?: string
          institution?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_payments_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "institution_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          failed_count: number
          id: string
          is_locked: boolean
          last_attempt_at: string
          locked_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          failed_count?: number
          id?: string
          is_locked?: boolean
          last_attempt_at?: string
          locked_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          failed_count?: number
          id?: string
          is_locked?: boolean
          last_attempt_at?: string
          locked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_services: {
        Row: {
          business_name: string
          category: string
          created_at: string
          description: string
          email: string
          full_description: string | null
          hours: string | null
          id: string
          image_url: string | null
          location: string | null
          owner_name: string
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_name: string
          category: string
          created_at?: string
          description: string
          email: string
          full_description?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          owner_name: string
          phone: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          created_at?: string
          description?: string
          email?: string
          full_description?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          owner_name?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          created_at: string
          id: string
          is_from_admin: boolean
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_from_admin?: boolean
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_from_admin?: boolean
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          category: string
          content: string
          created_at: string
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          email: string
          fees_count: number
          id: string
          notification_type: string
          sent_by: string
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          fees_count?: number
          id?: string
          notification_type?: string
          sent_by: string
          total_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          fees_count?: number
          id?: string
          notification_type?: string
          sent_by?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          apartment_number: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          building: string | null
          city: string | null
          created_at: string
          description: string | null
          features: string[] | null
          full_description: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          neighborhood: string | null
          owner_name: string | null
          owner_whatsapp: string | null
          parking_spots: number | null
          price: number | null
          property_type: string
          state: string | null
          title: string
          transaction_type: string
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          apartment_number?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          building?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          full_description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          neighborhood?: string | null
          owner_name?: string | null
          owner_whatsapp?: string | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string
          state?: string | null
          title: string
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          apartment_number?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          building?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          full_description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          neighborhood?: string | null
          owner_name?: string | null
          owner_whatsapp?: string | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string
          state?: string | null
          title?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          area_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          reservation_date: string
          start_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          reservation_date: string
          start_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          reservation_date?: string
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "common_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          apartamento: number
          bloco: number
          categoria: string
          contacto: string
          created_at: string
          divida_anterior: number
          divida_inicial: number
          edificio: number
          id: string
          nome: string
          ord: number
          pagamentos_historicos: number
          updated_at: string
          user_id: string | null
          via: string
        }
        Insert: {
          apartamento?: number
          bloco?: number
          categoria?: string
          contacto?: string
          created_at?: string
          divida_anterior?: number
          divida_inicial?: number
          edificio?: number
          id?: string
          nome: string
          ord?: number
          pagamentos_historicos?: number
          updated_at?: string
          user_id?: string | null
          via?: string
        }
        Update: {
          apartamento?: number
          bloco?: number
          categoria?: string
          contacto?: string
          created_at?: string
          divida_anterior?: number
          divida_inicial?: number
          edificio?: number
          id?: string
          nome?: string
          ord?: number
          pagamentos_historicos?: number
          updated_at?: string
          user_id?: string | null
          via?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_any_admin_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "resident"
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
      app_role: ["admin", "resident"],
    },
  },
} as const
