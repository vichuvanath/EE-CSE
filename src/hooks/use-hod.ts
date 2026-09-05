"use client";

import {
  mockHodDashboardStats,
  mockHodFaculty,
  mockHodApprovals,
  mockAdvisorStudents,
  getHodTeamsByBatch,
  getAllHodTeams,
} from "@/lib/mock-fallback";
import type {
  HodDashboardStats,
  HodFacultyMember,
  HodApprovalRecord,
  AdvisorTeamSummary,
  AdvisorStudent,
} from "@/types";

/**
 * Returns department-level dashboard statistics.
 */
export function useHodDashboard(): HodDashboardStats {
  return mockHodDashboardStats;
}

/**
 * Returns the list of all CSE faculty members.
 */
export function useHodFaculty(): HodFacultyMember[] {
  return mockHodFaculty;
}

/**
 * Returns teams filtered by the given batch string.
 * If batch is empty or "all", returns all teams across batches.
 */
export function useHodTeams(batch: string): AdvisorTeamSummary[] {
  return getHodTeamsByBatch(batch);
}

/**
 * Returns all teams across all batches.
 */
export function useHodAllTeams(): AdvisorTeamSummary[] {
  return getAllHodTeams();
}

/**
 * Returns students extracted from all teams for the given batch.
 * Builds student records from team member data for a department-wide view.
 */
export function useHodStudents(batch: string): AdvisorStudent[] {
  const teams = getHodTeamsByBatch(batch);
  const students: AdvisorStudent[] = [];

  for (const team of teams) {
    const guide = team.guide;
    for (const member of team.members || []) {
      // Try to find matching mock advisor student for marks data
      const existingStudent = mockAdvisorStudents.find(
        (s) => s.roll_number === member.roll_number
      );

      students.push({
        id: member.id,
        student_id: member.student_id,
        roll_number: member.roll_number || "",
        full_name: member.full_name,
        email: member.email || "",
        team_name: team.name,
        team_id: team.team_id,
        project_title: team.project_title,
        evaluation_status: team.evaluation_status,
        total_marks: existingStudent?.total_marks ?? null,
        guide: guide
          ? {
              name: guide.name,
              designation: guide.designation || "Professor",
              department: guide.department || "CSE",
            }
          : undefined,
      });
    }
  }

  return students;
}

/**
 * Returns teams that have been evaluated (have scores).
 */
export function useHodEvaluations(batch: string): AdvisorTeamSummary[] {
  const teams = getHodTeamsByBatch(batch);
  return teams.filter(
    (t) =>
      t.evaluation_status === "EVALUATED" ||
      t.evaluation_status === "SUBMITTED" ||
      t.evaluation_status === "LOCKED"
  );
}

/**
 * Returns approval records.
 */
export function useHodApprovals(): HodApprovalRecord[] {
  return mockHodApprovals;
}
