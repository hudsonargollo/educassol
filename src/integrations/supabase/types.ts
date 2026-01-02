export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom types for usage tracking
export type GenerationType =
  | 'lesson-plan'
  | 'activity'
  | 'worksheet'
  | 'quiz'
  | 'reading'
  | 'slides'
  | 'assessment'
  | 'file-upload';

export type Tier = 'free' | 'premium' | 'enterprise';

export type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled';

export interface UsageLog {
  id: string;
  user_id: string;
  generation_type: GenerationType;
  tier: Tier;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface MonthlyUsage {
  lessonPlans: number;
  activities: number;
  assessments: number;
  fileUploads: number;
}

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calendario: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          id: string
          relevancia_pedagogica: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          relevancia_pedagogica?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          relevancia_pedagogica?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          detalhes_ane: string | null
          grade: string
          id: string
          possui_ane: boolean | null
          school_id: string
          subject: string
          teacher_id: string | null
          total_alunos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detalhes_ane?: string | null
          grade: string
          id?: string
          possui_ane?: boolean | null
          school_id: string
          subject: string
          teacher_id?: string | null
          total_alunos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detalhes_ane?: string | null
          grade?: string
          id?: string
          possui_ane?: boolean | null
          school_id?: string
          subject?: string
          teacher_id?: string | null
          total_alunos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          created_at: string
          description: string | null
          grade_levels: string[]
          id: string
          methodology:
            | Database["public"]["Enums"]["content_methodology"][]
            | null
          prompt_template: string
          subjects: string[]
          supports_accessibility: boolean | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_levels?: string[]
          id?: string
          methodology?:
            | Database["public"]["Enums"]["content_methodology"][]
            | null
          prompt_template: string
          subjects?: string[]
          supports_accessibility?: boolean | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_levels?: string[]
          id?: string
          methodology?:
            | Database["public"]["Enums"]["content_methodology"][]
            | null
          prompt_template?: string
          subjects?: string[]
          supports_accessibility?: boolean | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          id: string
          educator_id: string
          school_id: string
          class_id: string | null
          title: string
          description: string | null
          rubric: Json
          status: Database["public"]["Enums"]["exam_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          educator_id: string
          school_id: string
          class_id?: string | null
          title: string
          description?: string | null
          rubric: Json
          status?: Database["public"]["Enums"]["exam_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          educator_id?: string
          school_id?: string
          class_id?: string | null
          title?: string
          description?: string | null
          rubric?: Json
          status?: Database["public"]["Enums"]["exam_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_educator_id_fkey"
            columns: ["educator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          accessibility_options: string[] | null
          author_id: string
          bncc_codes: string[] | null
          class_id: string | null
          content: string
          created_at: string
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes: number | null
          id: string
          materials_needed: string[] | null
          metadata: Json | null
          methodology: Database["public"]["Enums"]["content_methodology"] | null
          objectives: string[] | null
          prompt: string
          school_id: string
          student_age_range: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          accessibility_options?: string[] | null
          author_id: string
          bncc_codes?: string[] | null
          class_id?: string | null
          content: string
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          id?: string
          materials_needed?: string[] | null
          metadata?: Json | null
          methodology?:
            | Database["public"]["Enums"]["content_methodology"]
            | null
          objectives?: string[] | null
          prompt: string
          school_id: string
          student_age_range?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          accessibility_options?: string[] | null
          author_id?: string
          bncc_codes?: string[] | null
          class_id?: string | null
          content?: string
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          id?: string
          materials_needed?: string[] | null
          metadata?: Json | null
          methodology?:
            | Database["public"]["Enums"]["content_methodology"]
            | null
          objectives?: string[] | null
          prompt?: string
          school_id?: string
          student_age_range?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_content_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district_id: string | null
          email: string
          id: string
          name: string
          school_id: string | null
          updated_at: string
          tier: Database["public"]["Enums"]["user_tier"]
          mp_customer_id: string | null
          mp_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          email: string
          id: string
          name: string
          school_id?: string | null
          updated_at?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          mp_customer_id?: string | null
          mp_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Update: {
          created_at?: string
          district_id?: string | null
          email?: string
          id?: string
          name?: string
          school_id?: string | null
          updated_at?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          mp_customer_id?: string | null
          mp_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          generation_type: Database["public"]["Enums"]["generation_type"]
          tier: Database["public"]["Enums"]["user_tier"]
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          generation_type: Database["public"]["Enums"]["generation_type"]
          tier: Database["public"]["Enums"]["user_tier"]
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          generation_type?: Database["public"]["Enums"]["generation_type"]
          tier?: Database["public"]["Enums"]["user_tier"]
          created_at?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string
          created_at: string
          district_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          district_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          district_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          id: string
          exam_id: string
          student_identifier: string | null
          storage_path: string
          file_type: Database["public"]["Enums"]["submission_file_type"]
          file_size_bytes: number
          status: Database["public"]["Enums"]["submission_status"]
          error_message: string | null
          uploaded_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          exam_id: string
          student_identifier?: string | null
          storage_path: string
          file_type: Database["public"]["Enums"]["submission_file_type"]
          file_size_bytes: number
          status?: Database["public"]["Enums"]["submission_status"]
          error_message?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          exam_id?: string
          student_identifier?: string | null
          storage_path?: string
          file_type?: Database["public"]["Enums"]["submission_file_type"]
          file_size_bytes?: number
          status?: Database["public"]["Enums"]["submission_status"]
          error_message?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          id: string
          submission_id: string
          ai_output: Json
          total_score: number | null
          pdf_report_url: string | null
          verification_token: string
          graded_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          ai_output: Json
          pdf_report_url?: string | null
          verification_token?: string
          graded_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          ai_output?: Json
          pdf_report_url?: string | null
          verification_token?: string
          graded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_user_district_id: { Args: { _user_id: string }; Returns: string }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "district_admin" | "school_admin" | "teacher" | "super_admin"
      content_methodology:
        | "active_learning"
        | "traditional"
        | "project_based"
        | "gamification"
        | "flipped_classroom"
        | "collaborative"
        | "inquiry_based"
      difficulty_level: "basic" | "intermediate" | "advanced"
      exam_status: "draft" | "published" | "archived"
      submission_status: "uploaded" | "processing" | "graded" | "failed"
      submission_file_type: "pdf" | "jpeg" | "png"
      generation_type:
        | "lesson-plan"
        | "activity"
        | "worksheet"
        | "quiz"
        | "reading"
        | "slides"
        | "assessment"
        | "file-upload"
      user_tier: "free" | "premium" | "enterprise"
      subscription_status: "active" | "pending" | "paused" | "cancelled"
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
      app_role: ["district_admin", "school_admin", "teacher", "super_admin"],
      content_methodology: [
        "active_learning",
        "traditional",
        "project_based",
        "gamification",
        "flipped_classroom",
        "collaborative",
        "inquiry_based",
      ],
      difficulty_level: ["basic", "intermediate", "advanced"],
      exam_status: ["draft", "published", "archived"],
      submission_status: ["uploaded", "processing", "graded", "failed"],
      submission_file_type: ["pdf", "jpeg", "png"],
      generation_type: [
        "lesson-plan",
        "activity",
        "worksheet",
        "quiz",
        "reading",
        "slides",
        "assessment",
        "file-upload",
      ],
      user_tier: ["free", "premium", "enterprise"],
      subscription_status: ["active", "pending", "paused", "cancelled"],
    },
  },
} as const
