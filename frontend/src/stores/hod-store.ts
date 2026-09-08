import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EvaluationScheme, HodNotification } from "@/types/hod";

export interface HodState {
  academicYear: string;
  selectedBatch: string;
  availableBatches: string[];
  activeSchemeId: string;
  evaluationSchemes: EvaluationScheme[];
  notifications: HodNotification[];
  notificationDrawerOpen: boolean;

  // Actions
  setAcademicYear: (year: string) => void;
  setSelectedBatch: (batch: string) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  saveEvaluationScheme: (scheme: EvaluationScheme) => void;
  publishEvaluationScheme: (id: string) => void;
  archiveEvaluationScheme: (id: string) => void;
}

const defaultScheme: EvaluationScheme = {
  id: "scheme-2026-27",
  title: "SIET ECE/CSE Autonomous Project Evaluation Framework 2026-27",
  academic_year: "2026-27",
  status: "ACTIVE",
  formulated_by: "Dr. R. Venkatesh, M.E., Ph.D. (HOD)",
  instructions:
    "Advisors and PRC committee members must adhere to autonomous regulation rubrics. Ensure comprehensive evaluation of both technical implementation and architectural documentation.",
  total_marks: 100,
  created_at: "2026-06-15T09:00:00Z",
  updated_at: "2026-08-10T14:30:00Z",
  stages: [
    {
      id: "stg-1",
      stage_number: 1,
      title: "Problem Definition & Literature Survey",
      total_weightage: 10,
      passing_marks: 5,
      criteria: [
        {
          id: "c-1-1",
          title: "Problem Articulation & Scope Definition",
          description: "Clarity of engineering problem, societal relevance, and system boundaries.",
          max_marks: 5,
        },
        {
          id: "c-1-2",
          title: "Comprehensive Literature Survey (IEEE/Scopus)",
          description: "Review of minimum 8 recent peer-reviewed publications and comparative analysis.",
          max_marks: 5,
        },
      ],
    },
    {
      id: "stg-2",
      stage_number: 2,
      title: "System Architecture & Design",
      total_weightage: 15,
      passing_marks: 8,
      criteria: [
        {
          id: "c-2-1",
          title: "Hardware / Software Architectural Schematics",
          description: "Block diagrams, dataflow specifications, circuit or modular layouts.",
          max_marks: 8,
        },
        {
          id: "c-2-2",
          title: "Component Feasibility & Bill of Materials",
          description: "Specification of sensors, processors, frameworks, and interface protocols.",
          max_marks: 7,
        },
      ],
    },
    {
      id: "stg-3",
      stage_number: 3,
      title: "Intermediate Implementation & Progress",
      total_weightage: 20,
      passing_marks: 10,
      criteria: [
        {
          id: "c-3-1",
          title: "Core Algorithm & Module Development",
          description: "Verification of functioning backend/embedded routines or hardware modules.",
          max_marks: 10,
        },
        {
          id: "c-3-2",
          title: "Milestone Compliance & Logbook Maintenance",
          description: "Consistency of regular guide meetings and logbook verifications.",
          max_marks: 10,
        },
      ],
    },
    {
      id: "stg-4",
      stage_number: 4,
      title: "Complete Technical Implementation",
      total_weightage: 25,
      passing_marks: 12,
      criteria: [
        {
          id: "c-4-1",
          title: "End-to-End System Integration & Working Prototype",
          description: "Fully assembled functional hardware/software demonstration under test conditions.",
          max_marks: 15,
        },
        {
          id: "c-4-2",
          title: "Robustness, Edge Cases & Error Handling",
          description: "System stability, security considerations, and fault resilience.",
          max_marks: 10,
        },
      ],
    },
    {
      id: "stg-5",
      stage_number: 5,
      title: "Pre-Submission Testing & Documentation",
      total_weightage: 15,
      passing_marks: 8,
      criteria: [
        {
          id: "c-5-1",
          title: "Test Vector Validation & Benchmark Metrics",
          description: "Quantitative performance analysis vs existing baselines.",
          max_marks: 8,
        },
        {
          id: "c-5-2",
          title: "Draft Thesis / Project Report Quality",
          description: "Plagiarism verification (< 15%), citation format, and compliance with SIET guide.",
          max_marks: 7,
        },
      ],
    },
    {
      id: "stg-6",
      stage_number: 6,
      title: "Final Viva Voce & Project Defense",
      total_weightage: 15,
      passing_marks: 8,
      criteria: [
        {
          id: "c-6-1",
          title: "Technical Presentation & Defense",
          description: "Confidence, technical depth, and mastery of architectural choices.",
          max_marks: 8,
        },
        {
          id: "c-6-2",
          title: "Response to External PRC Committee Queries",
          description: "Ability to address interdisciplinary queries and suggest future improvements.",
          max_marks: 7,
        },
      ],
    },
  ],
};

const initialNotifications: HodNotification[] = [
  {
    id: "notif-1",
    title: "Advisor Evaluation Overdue",
    message: "Prof. S. Suresh has 3 team evaluations pending beyond the 7-day review window for Stage 4.",
    timestamp: "10 mins ago",
    category: "ALERT",
    type: "EVALUATION",
    is_read: false,
    link: "/hod/advisors",
  },
  {
    id: "notif-2",
    title: "Administrative Guide Reallocation",
    message: "Admin reallocated Dr. P. Suresh to Team RoboTech following emergency medical leave.",
    timestamp: "1 hour ago",
    category: "INFO",
    type: "ADMIN",
    is_read: false,
    link: "/hod/change-history",
  },
  {
    id: "notif-3",
    title: "Evaluation Cycle Complete",
    message: "Dr. A. Nandhini completed Stage 3 evaluations for all 4 assigned teams.",
    timestamp: "3 hours ago",
    category: "SUCCESS",
    type: "EVALUATION",
    is_read: true,
    link: "/hod/advisors",
  },
  {
    id: "notif-4",
    title: "Critical Project Health Flag",
    message: "Team QuantumCipher has scored below 50% threshold on Stage 2. PRC committee intervention advised.",
    timestamp: "Yesterday",
    category: "WARNING",
    type: "GENERAL",
    is_read: false,
    link: "/hod/dashboard",
  },
];

export const useHodStore = create<HodState>()(
  persist(
    (set, get) => ({
      academicYear: "2026-27",
      selectedBatch: "2025–2029",
      availableBatches: ["2025–2029", "2024–2028", "2023–2027"],
      activeSchemeId: "scheme-2026-27",
      evaluationSchemes: [defaultScheme],
      notifications: initialNotifications,
      notificationDrawerOpen: false,

      setAcademicYear: (academicYear) => set({ academicYear }),
      setSelectedBatch: (selectedBatch) => set({ selectedBatch }),
      setNotificationDrawerOpen: (notificationDrawerOpen) =>
        set({ notificationDrawerOpen }),

      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
        }),

      markAllNotificationsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({
            ...n,
            is_read: true,
          })),
        }),

      saveEvaluationScheme: (scheme) => {
        const schemes = get().evaluationSchemes;
        const index = schemes.findIndex((s) => s.id === scheme.id);
        if (index >= 0) {
          const updated = [...schemes];
          updated[index] = { ...scheme, updated_at: new Date().toISOString() };
          set({ evaluationSchemes: updated });
        } else {
          set({
            evaluationSchemes: [
              ...schemes,
              {
                ...scheme,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          });
        }
      },

      publishEvaluationScheme: (id) => {
        set({
          activeSchemeId: id,
          evaluationSchemes: get().evaluationSchemes.map((s) =>
            s.id === id
              ? { ...s, status: "ACTIVE", updated_at: new Date().toISOString() }
              : s.status === "ACTIVE"
              ? { ...s, status: "ARCHIVED", updated_at: new Date().toISOString() }
              : s
          ),
        });
      },

      archiveEvaluationScheme: (id) => {
        set({
          evaluationSchemes: get().evaluationSchemes.map((s) =>
            s.id === id
              ? { ...s, status: "ARCHIVED", updated_at: new Date().toISOString() }
              : s
          ),
        });
      },
    }),
    {
      name: "siet-hod-storage",
      partialize: (state) => ({
        academicYear: state.academicYear,
        selectedBatch: state.selectedBatch,
        activeSchemeId: state.activeSchemeId,
        evaluationSchemes: state.evaluationSchemes,
      }),
    }
  )
);
