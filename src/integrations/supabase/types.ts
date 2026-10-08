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
      assessment_results: {
        Row: {
          answers: Json
          created_at: string
          email: string
          first_name: string
          gap: string
          id: string
          last_name: string | null
          phone: string | null
          pillars: Json
          purchased_at: string | null
          report_token: string
          report_views: number
          score: number
          site_origin: string | null
          sms_consent: boolean
          tier: string
          unsub_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          answers: Json
          created_at?: string
          email: string
          first_name: string
          gap: string
          id?: string
          last_name?: string | null
          phone?: string | null
          pillars: Json
          purchased_at?: string | null
          report_token?: string
          report_views?: number
          score: number
          site_origin?: string | null
          sms_consent?: boolean
          tier: string
          unsub_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          email?: string
          first_name?: string
          gap?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          pillars?: Json
          purchased_at?: string | null
          report_token?: string
          report_views?: number
          score?: number
          site_origin?: string | null
          sms_consent?: boolean
          tier?: string
          unsub_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          file_path: string
          id: string
          label: string
        }
        Insert: {
          client_id: string
          created_at?: string
          file_path: string
          id?: string
          label: string
        }
        Update: {
          client_id?: string
          created_at?: string
          file_path?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          credit_expires_at: string | null
          credit_redeemed_at: string | null
          email: string
          first_name: string | null
          id: string
          intake: Json
          intake_submitted_at: string | null
          plan_delivered_at: string | null
          portal_token: string
          product: string
        }
        Insert: {
          created_at?: string
          credit_expires_at?: string | null
          credit_redeemed_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          intake?: Json
          intake_submitted_at?: string | null
          plan_delivered_at?: string | null
          portal_token?: string
          product: string
        }
        Update: {
          created_at?: string
          credit_expires_at?: string | null
          credit_redeemed_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          intake?: Json
          intake_submitted_at?: string | null
          plan_delivered_at?: string | null
          portal_token?: string
          product?: string
        }
        Relationships: []
      }
      consent_log: {
        Row: {
          consent_at: string
          consent_text: string
          consent_version: string
          email: string
          email_consent: boolean
          id: string
          ip: string | null
          page_url: string | null
          phone: string | null
          sms_consent: boolean
          user_agent: string | null
        }
        Insert: {
          consent_at?: string
          consent_text: string
          consent_version: string
          email: string
          email_consent: boolean
          id?: string
          ip?: string | null
          page_url?: string | null
          phone?: string | null
          sms_consent: boolean
          user_agent?: string | null
        }
        Update: {
          consent_at?: string
          consent_text?: string
          consent_version?: string
          email?: string
          email_consent?: boolean
          id?: string
          ip?: string | null
          page_url?: string | null
          phone?: string | null
          sms_consent?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          cta_id: string | null
          device: string | null
          event_name: string
          id: string
          path: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          cta_id?: string | null
          device?: string | null
          event_name: string
          id?: string
          path?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          cta_id?: string | null
          device?: string | null
          event_name?: string
          id?: string
          path?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      kit_leads: {
        Row: {
          business_name: string | null
          created_at: string
          device: string | null
          download_count: number
          email: string
          first_name: string
          id: string
          last_name: string | null
          phone: string | null
          source: string | null
          token_expires_at: string
          verified: boolean
          verified_at: string | null
          verify_token: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          device?: string | null
          download_count?: number
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          token_expires_at?: string
          verified?: boolean
          verified_at?: string | null
          verify_token?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          device?: string | null
          download_count?: number
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          token_expires_at?: string
          verified?: boolean
          verified_at?: string | null
          verify_token?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          biggest_challenge: string | null
          business_name: string | null
          certifications: string[]
          contract_size: string | null
          contract_strategy: string | null
          created_at: string
          device: string | null
          email: string
          first_name: string
          id: string
          industry: string | null
          journey_stage: string | null
          last_name: string
          naics_code: string | null
          notified: boolean
          phone: string | null
          recommendation: string | null
          referral_source: string | null
          revenue: string | null
          sam_status: string | null
          source: string | null
          target_agencies: string | null
          token_expires_at: string
          verified: boolean
          verified_at: string | null
          verify_token: string
        }
        Insert: {
          biggest_challenge?: string | null
          business_name?: string | null
          certifications?: string[]
          contract_size?: string | null
          contract_strategy?: string | null
          created_at?: string
          device?: string | null
          email: string
          first_name: string
          id?: string
          industry?: string | null
          journey_stage?: string | null
          last_name: string
          naics_code?: string | null
          notified?: boolean
          phone?: string | null
          recommendation?: string | null
          referral_source?: string | null
          revenue?: string | null
          sam_status?: string | null
          source?: string | null
          target_agencies?: string | null
          token_expires_at?: string
          verified?: boolean
          verified_at?: string | null
          verify_token?: string
        }
        Update: {
          biggest_challenge?: string | null
          business_name?: string | null
          certifications?: string[]
          contract_size?: string | null
          contract_strategy?: string | null
          created_at?: string
          device?: string | null
          email?: string
          first_name?: string
          id?: string
          industry?: string | null
          journey_stage?: string | null
          last_name?: string
          naics_code?: string | null
          notified?: boolean
          phone?: string | null
          recommendation?: string | null
          referral_source?: string | null
          revenue?: string | null
          sam_status?: string | null
          source?: string | null
          target_agencies?: string | null
          token_expires_at?: string
          verified?: boolean
          verified_at?: string | null
          verify_token?: string
        }
        Relationships: []
      }
      naics_digest_state: {
        Row: {
          id: number
          last_run_at: string | null
          locked_until: string | null
          paused_reason: string | null
        }
        Insert: {
          id?: number
          last_run_at?: string | null
          locked_until?: string | null
          paused_reason?: string | null
        }
        Update: {
          id?: number
          last_run_at?: string | null
          locked_until?: string | null
          paused_reason?: string | null
        }
        Relationships: []
      }
      naics_reports: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string | null
          naics: string
          opportunity_count: number | null
          sent_at: string | null
          status: string
          status_reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          naics: string
          opportunity_count?: number | null
          sent_at?: string | null
          status?: string
          status_reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          naics?: string
          opportunity_count?: number | null
          sent_at?: string | null
          status?: string
          status_reason?: string | null
        }
        Relationships: []
      }
      naics_subscriptions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_sent_at: string | null
          last_status: string | null
          naics: string
          send_count: number
          unsub_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_sent_at?: string | null
          last_status?: string | null
          naics: string
          send_count?: number
          unsub_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_sent_at?: string | null
          last_status?: string | null
          naics?: string
          send_count?: number
          unsub_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          email: string
          id: string
          payload: Json | null
          price_cents: number | null
          product: string
          sale_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          payload?: Json | null
          price_cents?: number | null
          product: string
          sale_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          payload?: Json | null
          price_cents?: number | null
          product?: string
          sale_id?: string
        }
        Relationships: []
      }
      samgov_ai_profile: {
        Row: {
          id: number
          profile_text: string
          updated_at: string
        }
        Insert: {
          id?: number
          profile_text?: string
          updated_at?: string
        }
        Update: {
          id?: number
          profile_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      samgov_api_credentials: {
        Row: {
          api_key_encrypted: string
          api_key_last4: string
          created_at: string
          id: string
          is_active: boolean
          last_test_status: string
          last_tested_at: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted: string
          api_key_last4: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_status?: string
          last_tested_at?: string | null
          provider?: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string
          api_key_last4?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_status?: string
          last_tested_at?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      samgov_fetch_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          date_from: string
          date_to: string
          duplicate_records: number
          error_count: number
          error_message: string | null
          id: string
          naics_codes_requested: string[]
          new_opportunities: number
          started_at: string
          status: string
          total_api_requests: number
          total_records_received: number
          updated_opportunities: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date_from: string
          date_to: string
          duplicate_records?: number
          error_count?: number
          error_message?: string | null
          id?: string
          naics_codes_requested?: string[]
          new_opportunities?: number
          started_at?: string
          status?: string
          total_api_requests?: number
          total_records_received?: number
          updated_opportunities?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date_from?: string
          date_to?: string
          duplicate_records?: number
          error_count?: number
          error_message?: string | null
          id?: string
          naics_codes_requested?: string[]
          new_opportunities?: number
          started_at?: string
          status?: string
          total_api_requests?: number
          total_records_received?: number
          updated_opportunities?: number
        }
        Relationships: []
      }
      samgov_keyword_groups: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      samgov_keywords: {
        Row: {
          active: boolean
          created_at: string
          group_id: string
          id: string
          keyword: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          group_id: string
          id?: string
          keyword: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          group_id?: string
          id?: string
          keyword?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "samgov_keywords_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "samgov_keyword_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      samgov_naics: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          code: string
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      samgov_opportunities: {
        Row: {
          active: string | null
          created_at: string
          department: string | null
          description: string | null
          first_seen_at: string
          full_parent_path_name: string | null
          id: string
          last_seen_at: string
          naics_code: string | null
          notice_id: string
          office: string | null
          organization: string | null
          point_of_contact: Json
          posted_date: string | null
          raw_data: Json
          response_deadline: string | null
          solicitation_number: string | null
          sub_tier: string | null
          title: string | null
          type: string | null
          type_of_set_aside: string | null
          type_of_set_aside_description: string | null
          ui_link: string | null
          updated_at: string
        }
        Insert: {
          active?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          first_seen_at?: string
          full_parent_path_name?: string | null
          id?: string
          last_seen_at?: string
          naics_code?: string | null
          notice_id: string
          office?: string | null
          organization?: string | null
          point_of_contact?: Json
          posted_date?: string | null
          raw_data: Json
          response_deadline?: string | null
          solicitation_number?: string | null
          sub_tier?: string | null
          title?: string | null
          type?: string | null
          type_of_set_aside?: string | null
          type_of_set_aside_description?: string | null
          ui_link?: string | null
          updated_at?: string
        }
        Update: {
          active?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          first_seen_at?: string
          full_parent_path_name?: string | null
          id?: string
          last_seen_at?: string
          naics_code?: string | null
          notice_id?: string
          office?: string | null
          organization?: string | null
          point_of_contact?: Json
          posted_date?: string | null
          raw_data?: Json
          response_deadline?: string | null
          solicitation_number?: string | null
          sub_tier?: string | null
          title?: string | null
          type?: string | null
          type_of_set_aside?: string | null
          type_of_set_aside_description?: string | null
          ui_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      samgov_settings: {
        Row: {
          ai_fit_threshold: number
          ai_scoring_enabled: boolean
          auto_pagination: boolean
          case_insensitive: boolean
          created_at: string
          custom_posted_from: string | null
          custom_posted_to: string | null
          default_date_range: string
          id: number
          match_additional_description: boolean
          match_description: boolean
          match_solicitation_information: boolean
          match_title: boolean
          partial_phrase_matching: boolean
          results_per_request: number
          updated_at: string
        }
        Insert: {
          ai_fit_threshold?: number
          ai_scoring_enabled?: boolean
          auto_pagination?: boolean
          case_insensitive?: boolean
          created_at?: string
          custom_posted_from?: string | null
          custom_posted_to?: string | null
          default_date_range?: string
          id?: number
          match_additional_description?: boolean
          match_description?: boolean
          match_solicitation_information?: boolean
          match_title?: boolean
          partial_phrase_matching?: boolean
          results_per_request?: number
          updated_at?: string
        }
        Update: {
          ai_fit_threshold?: number
          ai_scoring_enabled?: boolean
          auto_pagination?: boolean
          case_insensitive?: boolean
          created_at?: string
          custom_posted_from?: string | null
          custom_posted_to?: string | null
          default_date_range?: string
          id?: number
          match_additional_description?: boolean
          match_description?: boolean
          match_solicitation_information?: boolean
          match_title?: boolean
          partial_phrase_matching?: boolean
          results_per_request?: number
          updated_at?: string
        }
        Relationships: []
      }
      sms_opt_outs: {
        Row: {
          opted_out_at: string
          phone: string
        }
        Insert: {
          opted_out_at?: string
          phone: string
        }
        Update: {
          opted_out_at?: string
          phone?: string
        }
        Relationships: []
      }
      training_messages: {
        Row: {
          assessment_email: string | null
          channel: string
          created_at: string
          id: string
          processed_at: string | null
          registration_id: string | null
          send_at: string
          sent_template: string | null
          sequence: string
          status: string
          status_reason: string | null
          template_key: string
        }
        Insert: {
          assessment_email?: string | null
          channel: string
          created_at?: string
          id?: string
          processed_at?: string | null
          registration_id?: string | null
          send_at: string
          sent_template?: string | null
          sequence?: string
          status?: string
          status_reason?: string | null
          template_key: string
        }
        Update: {
          assessment_email?: string | null
          channel?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          registration_id?: string | null
          send_at?: string
          sent_template?: string | null
          sequence?: string
          status?: string
          status_reason?: string | null
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_messages_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "training_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_registrations: {
        Row: {
          assessment_completed_at: string | null
          assessment_gap: string | null
          assessment_score: number | null
          assessment_tier: string | null
          attended_at: string | null
          checkout_started_at: string | null
          created_at: string
          cta_clicked_at: string | null
          device: string | null
          email: string
          first_name: string
          id: string
          max_progress_pct: number
          phone: string | null
          purchased_at: string | null
          session_start: string
          session_type: string
          site_origin: string | null
          sms_consent: boolean
          source: string | null
          unsub_token: string
          unsubscribed_at: string | null
          watch_seconds: number
        }
        Insert: {
          assessment_completed_at?: string | null
          assessment_gap?: string | null
          assessment_score?: number | null
          assessment_tier?: string | null
          attended_at?: string | null
          checkout_started_at?: string | null
          created_at?: string
          cta_clicked_at?: string | null
          device?: string | null
          email: string
          first_name: string
          id?: string
          max_progress_pct?: number
          phone?: string | null
          purchased_at?: string | null
          session_start: string
          session_type: string
          site_origin?: string | null
          sms_consent?: boolean
          source?: string | null
          unsub_token?: string
          unsubscribed_at?: string | null
          watch_seconds?: number
        }
        Update: {
          assessment_completed_at?: string | null
          assessment_gap?: string | null
          assessment_score?: number | null
          assessment_tier?: string | null
          attended_at?: string | null
          checkout_started_at?: string | null
          created_at?: string
          cta_clicked_at?: string | null
          device?: string | null
          email?: string
          first_name?: string
          id?: string
          max_progress_pct?: number
          phone?: string | null
          purchased_at?: string | null
          session_start?: string
          session_type?: string
          site_origin?: string | null
          sms_consent?: boolean
          source?: string | null
          unsub_token?: string
          unsubscribed_at?: string | null
          watch_seconds?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
