import { createContext, useContext } from "react";

// Step configuration constants
export const WIZARD_STEPS = [
  { number: 1, key: "context", label: "Contexto", phase: "Definindo o Contexto" },
  { number: 2, key: "objectives", label: "Objetivos", phase: "Definindo Objetivos" },
  { number: 3, key: "strategy", label: "Estratégia", phase: "Escolhendo Estratégia" },
  { number: 4, key: "configuration", label: "Configuração", phase: "Configurando Detalhes" },
  { number: 5, key: "review", label: "Revisão", phase: "Revisão Final" },
] as const;

// Grade options
export const GRADE_OPTIONS = [
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1º ano EM", "2º ano EM", "3º ano EM",
] as const;

// Subject options
export const SUBJECT_OPTIONS = [
  "Língua Portuguesa", "Matemática", "Ciências", "História",
  "Geografia", "Língua Inglesa", "Artes", "Educação Física", "Ensino Religioso",
] as const;

// Methodology options with icons and descriptions
export const METHODOLOGY_OPTIONS = [
  {
    id: "pbl",
    name: "Aprendizagem Baseada em Problemas",
    icon: "Lightbulb",
    description: "Alunos resolvem problemas reais aplicando conhecimentos",
  },
  {
    id: "project",
    name: "Aprendizagem Baseada em Projetos",
    icon: "FolderKanban",
    description: "Desenvolvimento de projetos práticos e colaborativos",
  },
  {
    id: "flipped",
    name: "Sala de Aula Invertida",
    icon: "RefreshCw",
    description: "Conteúdo estudado em casa, prática em sala",
  },
  {
    id: "gamification",
    name: "Gamificação",
    icon: "Gamepad2",
    description: "Elementos de jogos para engajar os alunos",
  },
  {
    id: "peer",
    name: "Aprendizagem por Pares",
    icon: "Users",
    description: "Alunos ensinam e aprendem uns com os outros",
  },
  {
    id: "stations",
    name: "Rotação por Estações",
    icon: "LayoutGrid",
    description: "Grupos rotacionam entre atividades diferentes",
  },
] as const;

// Accessibility options
export const ACCESSIBILITY_OPTIONS = [
  { id: "visual", label: "👁️ Alunos com deficiência visual" },
  { id: "auditiva", label: "👂 Alunos com deficiência auditiva" },
  { id: "tdah", label: "⚡ Alunos com transtorno do déficit de atenção (TDAH)" },
  { id: "autismo1", label: "🧩 Alunos com transtorno do espectro autista (Nível 1)" },
  { id: "autismo2", label: "🧩 Alunos com transtorno do espectro autista (Nível 2)" },
  { id: "autismo3", label: "🧩 Alunos com transtorno do espectro autista (Nível 3)" },
  { id: "intelectual", label: "🧠 Alunos com deficiência intelectual" },
  { id: "ansiedade", label: "😰 Alunos com transtornos de ansiedade" },
  { id: "superdotacao", label: "⭐ Alunos com altas habilidades ou superdotação" },
  { id: "motora", label: "🦽 Alunos com dificuldades motoras" },
  { id: "socializacao", label: "💛 Alunos com dificuldades de socialização" },
  { id: "linguistica", label: "🗣️ Alunos imigrantes com barreiras linguísticas" },
  { id: "socioeconomico", label: "🎒 Alunos com baixa participação por fatores socioeconômicos" },
] as const;

// Class context from selected class
export interface ClassContext {
  total_alunos: number | null;
  possui_ane: boolean;
  detalhes_ane: string | null;
}

// BNCC skill structure
export interface BnccSkill {
  code: string;
  description: string;
  relevance?: string;
}

// Main wizard state interface
export interface WizardState {
  // Step 1: Context
  classId?: string;
  classContext?: ClassContext;
  grade: string;
  subject: string;

  // Step 2: Objectives
  topic: string;
  selectedBnccCodes: BnccSkill[];

  // Step 3: Strategy
  methodologies: string[];
  templateId?: string;
  specificIdea: string;

  // Step 4: Configuration
  studentsPerClass: number;
  numberOfLessons: number;
  durationPerLesson: number;
  noDigitalResources: boolean;
  accessibilityOptions: string[];

  // Navigation
  currentStep: number;

  // Content type (lesson_plan, activity, assessment)
  contentType: string;
}

// Default initial state
export const DEFAULT_WIZARD_STATE: WizardState = {
  classId: undefined,
  classContext: undefined,
  grade: "",
  subject: "",
  topic: "",
  selectedBnccCodes: [],
  methodologies: [],
  templateId: undefined,
  specificIdea: "",
  studentsPerClass: 40,
  numberOfLessons: 1,
  durationPerLesson: 60,
  noDigitalResources: false,
  accessibilityOptions: [],
  currentStep: 1,
  contentType: "lesson_plan",
};

// Context value interface with state and actions
export interface WizardContextValue {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;
  resetWizard: () => void;
  setContentType: (contentType: string) => void;
}

// Create the context with undefined default (will be provided by WizardProvider)
export const WizardContext = createContext<WizardContextValue | undefined>(undefined);

// Custom hook to use wizard context with type safety
export const useWizard = (): WizardContextValue => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
