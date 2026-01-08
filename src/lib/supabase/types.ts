export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          // Profil fiscal
          monthly_amount: number | null;
          beneficiary_type: string | null;
          expense_type: string | null;
          is_married: boolean;
          children_count: number;
          annual_income: number | null;
          spouse_income: number | null;
          tmi: number | null;
          estimated_recovery: number;
          fiscal_parts: number | null;
          tax_before: number | null;
          tax_after: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          monthly_amount?: number | null;
          beneficiary_type?: string | null;
          expense_type?: string | null;
          is_married?: boolean;
          children_count?: number;
          annual_income?: number | null;
          spouse_income?: number | null;
          tmi?: number | null;
          estimated_recovery?: number;
          fiscal_parts?: number | null;
          tax_before?: number | null;
          tax_after?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          monthly_amount?: number | null;
          beneficiary_type?: string | null;
          expense_type?: string | null;
          is_married?: boolean;
          children_count?: number;
          annual_income?: number | null;
          spouse_income?: number | null;
          tmi?: number | null;
          estimated_recovery?: number;
          fiscal_parts?: number | null;
          tax_before?: number | null;
          tax_after?: number | null;
          updated_at?: string;
        };
      };
      tax_simulations: {
        Row: {
          id: string;
          user_id: string;
          monthly_sent: number;
          annual_deduction: number;
          beneficiary_type: "parents" | "children" | "siblings";
          is_married: boolean;
          children_count: number;
          annual_income: number;
          tax_gain: number;
          tmi: number;
          tax_before: number;
          tax_after: number;
          fiscal_parts: number;
          is_eligible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_sent: number;
          annual_deduction: number;
          beneficiary_type: "parents" | "children" | "siblings";
          is_married: boolean;
          children_count: number;
          annual_income: number;
          tax_gain: number;
          tmi: number;
          tax_before: number;
          tax_after: number;
          fiscal_parts: number;
          is_eligible: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          monthly_sent?: number;
          annual_deduction?: number;
          beneficiary_type?: "parents" | "children" | "siblings";
          is_married?: boolean;
          children_count?: number;
          annual_income?: number;
          tax_gain?: number;
          tmi?: number;
          tax_before?: number;
          tax_after?: number;
          fiscal_parts?: number;
          is_eligible?: boolean;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          simulation_id: string | null;
          file_name: string;
          file_url: string;
          file_type: string;
          provider: string | null;
          amount: number | null;
          transfer_date: string | null;
          ocr_status: "pending" | "processing" | "completed" | "failed";
          ocr_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          simulation_id?: string | null;
          file_name: string;
          file_url: string;
          file_type: string;
          provider?: string | null;
          amount?: number | null;
          transfer_date?: string | null;
          ocr_status?: "pending" | "processing" | "completed" | "failed";
          ocr_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          simulation_id?: string | null;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          provider?: string | null;
          amount?: number | null;
          transfer_date?: string | null;
          ocr_status?: "pending" | "processing" | "completed" | "failed";
          ocr_data?: Json | null;
          updated_at?: string;
        };
      };
    };
  };
}

// Types utilitaires
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type TaxSimulation = Database["public"]["Tables"]["tax_simulations"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];

export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type InsertTaxSimulation = Database["public"]["Tables"]["tax_simulations"]["Insert"];
export type InsertDocument = Database["public"]["Tables"]["documents"]["Insert"];
