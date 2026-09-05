import type { AdvisorTeamSummary, HodFacultyMember, AdvisorStudent } from "@/types";
import { getTeamGuide } from "@/lib/team-guide";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Export all teams evaluation data to Excel/CSV/PDF
 */
export function exportAllTeamsEvaluation(
  teams: AdvisorTeamSummary[],
  format: "xlsx" | "csv" | "pdf",
  batch: string
) {
  const evaluatedTeams = teams.filter(
    (t) => t.evaluation?.team_score != null
  );

  const rows = evaluatedTeams.map((team) => {
    const guide = getTeamGuide(team);
    const cs = team.evaluation?.criteria_scores;
    return {
      "Team Name": team.name,
      "Team ID": team.team_id,
      Batch: team.batch,
      Section: team.section,
      "Project Title": team.project_title,
      Guide: guide.name,
      "Guide Designation": guide.designation,
      "Guide Dept": guide.department,
      Members: team.member_count,
      "Project /20": cs?.project ?? "",
      "Technical /20": cs?.technical ?? "",
      "Presentation /20": cs?.presentation ?? "",
      "Documentation /20": cs?.documentation ?? "",
      "Contribution /20": cs?.contribution ?? "",
      "Total Score /100": team.evaluation?.team_score ?? "",
      Status: team.evaluation_status,
    };
  });

  if (format === "xlsx" || format === "csv") {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Evaluations");
    const ext = format === "xlsx" ? ".xlsx" : ".csv";
    XLSX.writeFile(wb, `HOD_All_Teams_Evaluation_${batch}${ext}`);
  } else {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Department Evaluation Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Batch: ${batch} | Department: CSE | SIET Autonomous`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [["Team", "Guide", "Project/20", "Tech/20", "Pres/20", "Doc/20", "Cont/20", "Total/100", "Status"]],
      body: evaluatedTeams.map((t) => {
        const guide = getTeamGuide(t);
        const cs = t.evaluation?.criteria_scores;
        return [
          t.name,
          guide.name,
          cs?.project ?? "—",
          cs?.technical ?? "—",
          cs?.presentation ?? "—",
          cs?.documentation ?? "—",
          cs?.contribution ?? "—",
          t.evaluation?.team_score ?? "—",
          t.evaluation_status,
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`HOD_All_Teams_Evaluation_${batch}.pdf`);
  }
}

/**
 * Export faculty workload report
 */
export function exportFacultyWorkload(
  faculty: HodFacultyMember[],
  teams: AdvisorTeamSummary[],
  format: "xlsx" | "csv"
) {
  const rows = faculty.map((f) => {
    const assignedTeams = teams.filter((t) => {
      const guide = getTeamGuide(t);
      return guide.name === f.name;
    });
    return {
      "Faculty Name": f.name,
      Designation: f.designation,
      Department: f.department,
      Email: f.email,
      Specialization: f.specialization || "",
      "Teams Assigned": assignedTeams.length,
      "Team Names": assignedTeams.map((t) => t.name).join(", "),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Faculty Workload");
  const ext = format === "xlsx" ? ".xlsx" : ".csv";
  XLSX.writeFile(wb, `HOD_Faculty_Workload${ext}`);
}

/**
 * Export student marks summary
 */
export function exportStudentMarks(
  students: AdvisorStudent[],
  format: "xlsx" | "csv" | "pdf",
  batch: string
) {
  const rows = students.map((s) => ({
    "Roll Number": s.roll_number,
    "Full Name": s.full_name,
    Email: s.email,
    Team: s.team_name || "",
    "Project Title": s.project_title || "",
    Guide: s.guide?.name || "",
    "Guide Designation": s.guide?.designation || "",
    "Total Marks": s.total_marks ?? "—",
    Status: s.evaluation_status || "",
  }));

  if (format === "xlsx" || format === "csv") {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Marks");
    const ext = format === "xlsx" ? ".xlsx" : ".csv";
    XLSX.writeFile(wb, `HOD_Student_Marks_${batch}${ext}`);
  } else {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Marks Summary", 14, 18);
    doc.setFontSize(10);
    doc.text(`Batch: ${batch} | Department: CSE`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Roll No", "Name", "Team", "Guide", "Marks", "Status"]],
      body: students.map((s) => [
        s.roll_number,
        s.full_name,
        s.team_name || "—",
        s.guide?.name || "—",
        s.total_marks ?? "—",
        s.evaluation_status || "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`HOD_Student_Marks_${batch}.pdf`);
  }
}

/**
 * Export batch summary PDF
 */
export function exportBatchSummary(
  teams: AdvisorTeamSummary[],
  batch: string
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Batch Summary Report — ${batch}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Department: Computer Science & Engineering | SIET Autonomous`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`, 14, 34);
  doc.text(`Total Teams: ${teams.length} | Total Students: ${teams.reduce((s, t) => s + t.member_count, 0)}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Team", "Project Title", "Guide", "Section", "Members", "Score", "Status"]],
    body: teams.map((t) => {
      const guide = getTeamGuide(t);
      return [
        t.name,
        t.project_title,
        guide.name,
        `Sec ${t.section}`,
        t.member_count,
        t.evaluation?.team_score ?? "—",
        t.evaluation_status,
      ];
    }),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`HOD_Batch_Summary_${batch}.pdf`);
}
