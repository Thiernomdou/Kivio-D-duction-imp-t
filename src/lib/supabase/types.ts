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
      receipts: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          sender_name: string | null;
          receiver_name: string | null;
          amount_sent: number | null;
          currency: string;
          fees: number;
          transfer_date: string | null;
          provider: string | null;
          ocr_confidence: number | null;
          is_validated: boolean;
          validation_status: "pending" | "auto_validated" | "manual_review" | "rejected";
          matched_relation: "father" | "mother" | "child" | null;
          match_confidence: number | null;
          amount_eur: number | null;
          exchange_rate: number | null;
          tax_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          sender_name?: string | null;
          receiver_name?: string | null;
          amount_sent?: number | null;
          currency?: string;
          fees?: number;
          transfer_date?: string | null;
          provider?: string | null;
          ocr_confidence?: number | null;
          is_validated?: boolean;
          validation_status?: "pending" | "auto_validated" | "manual_review" | "rejected";
          matched_relation?: "father" | "mother" | "child" | null;
          match_confidence?: number | null;
          amount_eur?: number | null;
          exchange_rate?: number | null;
          tax_year?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_path?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          sender_name?: string | null;
          receiver_name?: string | null;
          amount_sent?: number | null;
          currency?: string;
          fees?: number;
          transfer_date?: string | null;
          provider?: string | null;
          ocr_confidence?: number | null;
          is_validated?: boolean;
          validation_status?: "pending" | "auto_validated" | "manual_review" | "rejected";
          matched_relation?: "father" | "mother" | "child" | null;
          match_confidence?: number | null;
          amount_eur?: number | null;
          exchange_rate?: number | null;
          tax_year?: number;
          updated_at?: string;
        };
      };
      identity_documents: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          document_type: "livret_famille" | "extrait_naissance" | "acte_naissance" | null;
          person_name: string | null;
          father_name: string | null;
          mother_name: string | null;
          children: { name: string; birth_date?: string }[];
          ocr_confidence: number | null;
          is_validated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          document_type?: "livret_famille" | "extrait_naissance" | "acte_naissance" | null;
          person_name?: string | null;
          father_name?: string | null;
          mother_name?: string | null;
          children?: { name: string; birth_date?: string }[];
          ocr_confidence?: number | null;
          is_validated?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_path?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          document_type?: "livret_famille" | "extrait_naissance" | "acte_naissance" | null;
          person_name?: string | null;
          father_name?: string | null;
          mother_name?: string | null;
          children?: { name: string; birth_date?: string }[];
          ocr_confidence?: number | null;
          is_validated?: boolean;
          updated_at?: string;
        };
      };
      tax_calculations: {
        Row: {
          id: string;
          user_id: string;
          tax_year: number;
          total_receipts: number;
          total_amount_sent: number;
          total_fees: number;
          total_deductible: number;
          tmi_rate: number | null;
          tax_reduction: number | null;
          matched_relations: { father?: number; mother?: number; child?: number };
          status: "draft" | "calculated" | "finalized";
          pdf_path: string | null;
          pdf_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tax_year: number;
          total_receipts?: number;
          total_amount_sent?: number;
          total_fees?: number;
          total_deductible?: number;
          tmi_rate?: number | null;
          tax_reduction?: number | null;
          matched_relations?: { father?: number; mother?: number; child?: number };
          status?: "draft" | "calculated" | "finalized";
          pdf_path?: string | null;
          pdf_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tax_year?: number;
          total_receipts?: number;
          total_amount_sent?: number;
          total_fees?: number;
          total_deductible?: number;
          tmi_rate?: number | null;
          tax_reduction?: number | null;
          matched_relations?: { father?: number; mother?: number; child?: number };
          status?: "draft" | "calculated" | "finalized";
          pdf_path?: string | null;
          pdf_generated_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

// Types utilitaires - Row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type TaxSimulation = Database["public"]["Tables"]["tax_simulations"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Receipt = Database["public"]["Tables"]["receipts"]["Row"];
export type IdentityDocument = Database["public"]["Tables"]["identity_documents"]["Row"];
export type TaxCalculation = Database["public"]["Tables"]["tax_calculations"]["Row"];

// Insert types
export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type InsertTaxSimulation = Database["public"]["Tables"]["tax_simulations"]["Insert"];
export type InsertDocument = Database["public"]["Tables"]["documents"]["Insert"];
export type InsertReceipt = Database["public"]["Tables"]["receipts"]["Insert"];
export type InsertIdentityDocument = Database["public"]["Tables"]["identity_documents"]["Insert"];
export type InsertTaxCalculation = Database["public"]["Tables"]["tax_calculations"]["Insert"];

// Update types
export type UpdateReceipt = Database["public"]["Tables"]["receipts"]["Update"];
export type UpdateIdentityDocument = Database["public"]["Tables"]["identity_documents"]["Update"];
export type UpdateTaxCalculation = Database["public"]["Tables"]["tax_calculations"]["Update"];
