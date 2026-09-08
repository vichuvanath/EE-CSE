import { useQuery } from "@tanstack/react-query";
import { hodService } from "@/services/hod.service";

export const hodQueryKeys = {
  dashboardSummary: ["hod", "dashboard-summary"] as const,
  milestoneStages: ["hod", "milestone-stages"] as const,
  attentionItems: ["hod", "attention-items"] as const,
  liveActivity: ["hod", "live-activity"] as const,
  advisors: (batch?: string) => ["hod", "advisors", batch] as const,
  advisorDetail: (id: string, batch?: string) => ["hod", "advisor", id, batch] as const,
  advisorEvaluations: (id: string, batch?: string) => ["hod", "advisor-evaluations", id, batch] as const,
  adminChanges: ["hod", "admin-changes"] as const,
  compliance: ["hod", "compliance"] as const,
};

export function useHodDashboardSummary() {
  return useQuery({
    queryKey: hodQueryKeys.dashboardSummary,
    queryFn: () => hodService.getDashboardSummary(),
    staleTime: 60 * 1000,
  });
}

export function useHodMilestoneStages() {
  return useQuery({
    queryKey: hodQueryKeys.milestoneStages,
    queryFn: () => hodService.getMilestoneStages(),
    staleTime: 60 * 1000,
  });
}

export function useHodAttentionItems() {
  return useQuery({
    queryKey: hodQueryKeys.attentionItems,
    queryFn: () => hodService.getAttentionItems(),
    staleTime: 30 * 1000,
  });
}

export function useHodLiveActivity() {
  return useQuery({
    queryKey: hodQueryKeys.liveActivity,
    queryFn: () => hodService.getLiveActivity(),
    staleTime: 15 * 1000,
  });
}

export function useHodAdvisors(batch?: string) {
  return useQuery({
    queryKey: hodQueryKeys.advisors(batch),
    queryFn: () => hodService.getAdvisors(batch),
    staleTime: 60 * 1000,
  });
}

export function useHodAdvisorDetail(id: string, batch?: string) {
  return useQuery({
    queryKey: hodQueryKeys.advisorDetail(id, batch),
    queryFn: () => hodService.getAdvisorById(id, batch),
    staleTime: 60 * 1000,
    enabled: Boolean(id),
  });
}

export function useHodAdvisorEvaluations(advisorId: string, batch?: string) {
  return useQuery({
    queryKey: hodQueryKeys.advisorEvaluations(advisorId, batch),
    queryFn: () => hodService.getAdvisorEvaluationHistory(advisorId, batch),
    staleTime: 60 * 1000,
    enabled: Boolean(advisorId),
  });
}

export function useHodAdminChanges() {
  return useQuery({
    queryKey: hodQueryKeys.adminChanges,
    queryFn: () => hodService.getAdminChangeHistory(),
    staleTime: 60 * 1000,
  });
}

export function useHodCompliance() {
  return useQuery({
    queryKey: hodQueryKeys.compliance,
    queryFn: () => hodService.getComplianceRecords(),
    staleTime: 60 * 1000,
  });
}
