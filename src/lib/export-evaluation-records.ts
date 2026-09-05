import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getTeamGuide } from "@/lib/team-guide";

export interface SessionTeamMember {
  full_name: string;
  roll_number: string;
  role?: string;
}

export interface SessionCriteriaScores {
  project: number;
  technical: number;
  presentation: number;
  documentation: number;
  contribution: number;
}

export interface SessionTeamRecord {
  team_id: string;
  team_name: string;
  project_title: string;
  department?: string;
  guide_name?: string;
  guide_designation?: string;
  guide_department?: string;
  guide?: {
    name?: string;
    full_name?: string;
    designation?: string;
    department?: string;
    email?: string;
  };
  marks_allotted: number;
  max_marks: number;
  status: string;
  grade?: string;
  members: SessionTeamMember[];
  criteria_scores: SessionCriteriaScores;
  advisor_remarks: string;
  strengths: string;
  areas_for_improvement: string;
}

export interface EvaluationSession {
  id: string;
  evaluation_date: string; // e.g. "Saturday, August 29, 2026"
  evaluation_time: string; // e.g. "3:30 PM"
  raw_datetime: string;
  evaluator_name?: string;
  teams: SessionTeamRecord[];
}

/**
 * Downloads a comprehensive PDF evaluation record for an individual team in a session.
 */
export function downloadIndividualTeamRecord(
  team: SessionTeamRecord,
  session: EvaluationSession
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Institutional Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50); // #0F5132
  doc.text("SRI SHANMUGHA COLLEGE OF ENGINEERING AND TECHNOLOGY", pageWidth / 2, 40, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(
    "Autonomous Institution · Department of Computer Science & Engineering",
    pageWidth / 2,
    55,
    { align: "center" }
  );
  doc.text(
    "Project Review Committee (PRC) · Faculty Evaluation Record",
    pageWidth / 2,
    68,
    { align: "center" }
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 78, pageWidth - 40, 78);

  // Evaluation Session Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text("Evaluation Session Information", 40, 98);

  autoTable(doc, {
    startY: 106,
    margin: { left: 40, right: 40 },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 120 },
      1: { cellWidth: 150 },
      2: { fontStyle: "bold", cellWidth: 110 },
      3: { cellWidth: 140 },
    },
    body: [
      ["Evaluation Date:", session.evaluation_date, "Evaluation Time:", session.evaluation_time],
      ["Evaluation Status:", team.status, "Faculty Evaluator:", session.evaluator_name || "Dr. Arumugam V, Faculty Advisor"],
    ],
  });

  const sessionEndPos = (doc as any).lastAutoTable?.finalY || 135;

  // Team & Project Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Team & Project Dossier", 40, sessionEndPos + 18);

  autoTable(doc, {
    startY: sessionEndPos + 24,
    margin: { left: 40, right: 40 },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 120 },
      1: { cellWidth: 400 },
    },
    body: [
      ["Team Name:", `${team.team_name} (ID: ${team.team_id})`],
      ["Project Title:", team.project_title],
      ["Department:", team.department || "Computer Science & Engineering"],
    ],
  });

  const teamEndPos = (doc as any).lastAutoTable?.finalY || 200;

  // Guide Information Section (Team-specific assigned Faculty Guide)
  const resolvedGuide = getTeamGuide({
    id: team.team_id,
    team_id: team.team_id,
    name: team.team_name,
    team_name: team.team_name,
    guide_name: team.guide_name,
    guide_designation: team.guide_designation,
    guide_department: team.guide_department,
    guide: team.guide,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("GUIDE INFORMATION", 40, teamEndPos + 18);

  autoTable(doc, {
    startY: teamEndPos + 24,
    margin: { left: 40, right: 40 },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 120 },
      1: { cellWidth: 400 },
    },
    body: [
      ["Guide Name:", team.guide_name || resolvedGuide.name],
      ["Designation:", team.guide_designation || resolvedGuide.designation],
      ["Department:", team.guide_department || resolvedGuide.department],
    ],
  });

  const guideEndPos = (doc as any).lastAutoTable?.finalY || (teamEndPos + 75);

  // Team Members Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Enrolled Team Members (${team.members.length})`, 40, guideEndPos + 18);

  const memberRows = team.members.map((m, idx) => [
    String(idx + 1),
    m.full_name,
    m.roll_number,
    m.role || "Core Contributor",
  ]);

  autoTable(doc, {
    startY: guideEndPos + 24,
    margin: { left: 40, right: 40 },
    theme: "grid",
    head: [["No.", "Student Full Name", "Roll / Register No.", "Assigned Role"]],
    body: memberRows,
    headStyles: {
      fillColor: [15, 81, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center" },
      1: { cellWidth: 180, fontStyle: "bold" },
      2: { cellWidth: 140, font: "courier" },
      3: { cellWidth: 160 },
    },
  });

  const membersEndPos = (doc as any).lastAutoTable?.finalY || 290;

  // Criteria Marks Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Evaluation Criteria & Marks Breakdown", 40, membersEndPos + 18);

  const criteriaRows = [
    ["1", "Project Execution (Methodology & Scope)", "20.0", `${team.criteria_scores.project.toFixed(1)}`],
    ["2", "Technical Depth (Architecture & Source Code)", "20.0", `${team.criteria_scores.technical.toFixed(1)}`],
    ["3", "Presentation / Viva Voce (Defense Quality)", "20.0", `${team.criteria_scores.presentation.toFixed(1)}`],
    ["4", "Documentation (IEEE Standards & Completeness)", "20.0", `${team.criteria_scores.documentation.toFixed(1)}`],
    ["5", "Individual Contribution & Teamwork", "20.0", `${team.criteria_scores.contribution.toFixed(1)}`],
    ["", "TOTAL MARKS ALLOTTED", "100.0", `${team.marks_allotted.toFixed(1)} / ${team.max_marks}`],
  ];

  autoTable(doc, {
    startY: membersEndPos + 24,
    margin: { left: 40, right: 40 },
    theme: "grid",
    head: [["S.No", "Rubric Evaluation Criterion", "Max Marks", "Marks Awarded"]],
    body: criteriaRows,
    headStyles: {
      fillColor: [15, 81, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 40, halign: "center" },
      1: { cellWidth: 275 },
      2: { cellWidth: 100, halign: "center" },
      3: { cellWidth: 100, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      // Highlight Total row
      if (data.row.index === 5) {
        data.cell.styles.fillColor = [240, 253, 244]; // #F0FDF4
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [15, 81, 50];
      }
    },
  });

  const criteriaEndPos = (doc as any).lastAutoTable?.finalY || 420;

  // Feedback, Strengths, Remarks Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Faculty Remarks & Examination Feedback", 40, criteriaEndPos + 18);

  autoTable(doc, {
    startY: criteriaEndPos + 24,
    margin: { left: 40, right: 40 },
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 6, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 130, fillColor: [248, 250, 252] },
      1: { cellWidth: 385 },
    },
    body: [
      ["Advisor Remarks:", team.advisor_remarks || "Meets autonomous college quality standards."],
      ["Standout Strengths:", team.strengths || "Strong system architecture and functional demonstration."],
      ["Areas for Improvement:", team.areas_for_improvement || "Include performance latency graphs in final appendix."],
      ["Final Grade:", team.grade || (team.marks_allotted >= 90 ? "Outstanding (O)" : "Excellent (A+)")],
    ],
  });

  // Footer / Signature Section
  const footerY = pageHeight - 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);

  doc.text(
    "SIET Autonomous · Official Controller of Examinations (COE) Evaluation Record",
    40,
    footerY
  );
  doc.text(
    "Digitally Endorsed by Faculty Advisor",
    pageWidth - 40,
    footerY,
    { align: "right" }
  );

  const cleanTeam = team.team_name.replace(/\s+/g, "_");
  doc.save(`${cleanTeam}_Evaluation_Record.pdf`);
}

/**
 * Downloads a consolidated PDF report containing ONLY the teams evaluated
 * during that specific date/time record.
 */
export function downloadSessionAllTeamsReport(session: EvaluationSession): void {
  if (session.teams.length === 0) {
    throw new Error("No teams evaluated in this session.");
  }

  // A4 Landscape format
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50); // #0F5132
  doc.text("Advisor Evaluation Session Report", 40, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(
    "Department of Computer Science & Engineering · Project Review Committee (PRC) · SIET Autonomous",
    40,
    55
  );

  // Session metadata box on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Session: ${session.evaluation_date} — ${session.evaluation_time}`, pageWidth - 40, 40, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Teams Evaluated in this Session: ${session.teams.length} Teams`, pageWidth - 40, 54, {
    align: "right",
  });

  // Teams Table
  const headers = [
    [
      "S.No",
      "Team Name",
      "Team ID",
      "Assigned Guide",
      "Project Title",
      "Team Members",
      "Exec.\n/20",
      "Tech.\n/20",
      "Pres.\n/20",
      "Doc.\n/20",
      "Contrib.\n/20",
      "Total Marks\n/100",
      "Status",
    ],
  ];

  const body = session.teams.map((t, idx) => {
    const resolvedG = getTeamGuide({
      id: t.team_id,
      team_id: t.team_id,
      name: t.team_name,
      team_name: t.team_name,
      guide_name: t.guide_name,
      guide_designation: t.guide_designation,
      guide_department: t.guide_department,
      guide: t.guide,
    });
    const membersText = `${t.members.length} Members\n` + t.members.map((m) => `${m.full_name} (${m.roll_number})`).join("\n");
    const guideName = t.guide_name || resolvedG.name;
    const guideDesig = t.guide_designation || resolvedG.designation;
    const guideDept = t.guide_department || resolvedG.department;
    const guideText = `${guideName}\n${guideDesig} · ${guideDept}`;

    return [
      String(idx + 1),
      t.team_name,
      t.team_id,
      guideText,
      t.project_title,
      membersText,
      t.criteria_scores.project.toFixed(1),
      t.criteria_scores.technical.toFixed(1),
      t.criteria_scores.presentation.toFixed(1),
      t.criteria_scores.documentation.toFixed(1),
      t.criteria_scores.contribution.toFixed(1),
      `${t.marks_allotted.toFixed(1)} / ${t.max_marks}`,
      t.status,
    ];
  });

  autoTable(doc, {
    head: headers,
    body: body,
    startY: 68,
    margin: { left: 30, right: 30, bottom: 45 },
    theme: "grid",
    headStyles: {
      fillColor: [15, 81, 50],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      valign: "top",
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" }, // S.No
      1: { cellWidth: 72, fontStyle: "bold" }, // Team Name
      2: { cellWidth: 58, font: "courier", fontSize: 7 }, // Team ID
      3: { cellWidth: 96, fontStyle: "bold", textColor: [15, 81, 50] }, // Assigned Guide
      4: { cellWidth: 108 }, // Project Title
      5: { cellWidth: 145 }, // Members
      6: { cellWidth: 36, halign: "center" }, // Exec
      7: { cellWidth: 36, halign: "center" }, // Tech
      8: { cellWidth: 36, halign: "center" }, // Pres
      9: { cellWidth: 36, halign: "center" }, // Doc
      10: { cellWidth: 36, halign: "center" }, // Contrib
      11: { cellWidth: 52, halign: "center", fontStyle: "bold", textColor: [15, 81, 50] }, // Total Marks
      12: { cellWidth: 47, halign: "center" }, // Status
    },
    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Session Record: ${session.evaluation_date} (${session.evaluation_time}) · SIET Autonomous Examination Record`,
        40,
        pageHeight - 20
      );

      doc.text(`Page ${pageNumber}`, pageWidth - 40, pageHeight - 20, {
        align: "right",
      });
    },
  });

  const cleanDate = session.evaluation_date.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Evaluation_Session_${cleanDate}.pdf`);
}
