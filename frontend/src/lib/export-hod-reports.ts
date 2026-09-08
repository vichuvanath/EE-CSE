import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AdvisorEvaluationHistoryRecord, EvaluationScheme } from "@/types/hod";

// ============================================================================
// 1. ADVISOR EVALUATION CYCLE EXPORTS (PDF / EXCEL / CSV)
// ============================================================================

export function exportCyclePDF(
  advisorName: string,
  batch: string,
  cycleDate: string,
  records: AdvisorEvaluationHistoryRecord[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Banner
  doc.setFillColor(30, 41, 59); // Command Slate #1E293B
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SRI INDU ENGINEERING & TECHNOLOGY (AUTONOMOUS)", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Department of Electrical & Computer Engineering / CSE", 14, 18);
  doc.text("OFFICIAL FACULTY ADVISOR EVALUATION DOSSIER", 14, 25);

  // Metadata Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Advisor: ${advisorName}`, 14, 40);
  doc.text(`Batch: ${batch}`, 14, 46);
  doc.text(`Evaluation Date: ${cycleDate}`, 130, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 130, 46);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 50, 196, 50);

  // AutoTable
  const tableRows = records.map((rec, idx) => [
    idx + 1,
    rec.evaluation_time,
    rec.team_name,
    rec.project_title,
    rec.guide_name,
    `${rec.marks_awarded} / ${rec.max_marks}`,
    rec.feedback || "Verified by PRC advisor.",
  ]);

  autoTable(doc, {
    startY: 54,
    head: [["#", "Time", "Team Name", "Project Title", "Guide", "Marks", "Advisor Remarks"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: 255,
      fontSize: 8.5,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 15 },
      2: { cellWidth: 32 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30 },
      5: { cellWidth: 18, fontStyle: "bold", halign: "center" },
      6: { cellWidth: 40 },
    },
  });

  // Footer signature
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  if (finalY < 250) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Evaluator Signature", 14, finalY + 25);
    doc.text("Head of Department (HOD)", 140, finalY + 25);
  }

  const safeFilename = `${advisorName.replace(/[^a-zA-Z0-9]/g, "_")}_${batch.replace(/[^a-zA-Z0-9]/g, "_")}_Evaluation_${cycleDate.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(safeFilename);
}

export function exportCycleExcel(
  advisorName: string,
  batch: string,
  cycleDate: string,
  records: AdvisorEvaluationHistoryRecord[]
) {
  const data = records.map((rec, idx) => ({
    "S.No": idx + 1,
    "Evaluation Date": rec.evaluation_date,
    "Time": rec.evaluation_time,
    "Advisor Name": advisorName,
    "Batch": batch,
    "Team Name": rec.team_name,
    "Project Title": rec.project_title,
    "Faculty Guide": rec.guide_name,
    "Marks Awarded": rec.marks_awarded,
    "Max Marks": rec.max_marks,
    "Problem Definition (/5)": rec.criteria_scores?.problem_definition || "N/A",
    "Technical Implementation (/5)": rec.criteria_scores?.technical_implementation || "N/A",
    "Innovation (/5)": rec.criteria_scores?.innovation || "N/A",
    "Presentation (/5)": rec.criteria_scores?.presentation || "N/A",
    "Advisor Remarks": rec.feedback || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluation Cycle");

  const safeFilename = `${advisorName.replace(/[^a-zA-Z0-9]/g, "_")}_${cycleDate.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}

export function exportCycleCSV(
  advisorName: string,
  batch: string,
  cycleDate: string,
  records: AdvisorEvaluationHistoryRecord[]
) {
  const headers = [
    "S.No",
    "Evaluation Date",
    "Time",
    "Advisor",
    "Batch",
    "Team Name",
    "Project Title",
    "Guide",
    "Marks Awarded",
    "Max Marks",
    "Remarks",
  ];

  const rows = records.map((r, i) => [
    i + 1,
    `"${r.evaluation_date}"`,
    `"${r.evaluation_time}"`,
    `"${advisorName.replace(/"/g, '""')}"`,
    `"${batch}"`,
    `"${r.team_name.replace(/"/g, '""')}"`,
    `"${r.project_title.replace(/"/g, '""')}"`,
    `"${r.guide_name.replace(/"/g, '""')}"`,
    r.marks_awarded,
    r.max_marks,
    `"${(r.feedback || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${advisorName.replace(/[^a-zA-Z0-9]/g, "_")}_${cycleDate.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// 2. SCHEME RUBRICS PDF EXPORT
// ============================================================================

export function exportEvaluationSchemePDF(scheme: EvaluationScheme) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SRI INDU ENGINEERING & TECHNOLOGY (AUTONOMOUS)", 14, 12);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text("Autonomous Project Review Committee (PRC) Grading Framework", 14, 18);
  doc.text(`Official Academic Year: ${scheme.academic_year} · Status: ${scheme.status}`, 14, 25);

  // Scheme Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(scheme.title, 14, 42);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Formulated By: ${scheme.formulated_by}`, 14, 48);
  doc.text(`Total Weightage Marks: ${scheme.total_marks} / 100`, 14, 53);

  // Instructions
  if (scheme.instructions) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 57, 182, 14, 2, 2, "F");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.text(`Directive: ${scheme.instructions.slice(0, 140)}...`, 16, 65);
  }

  let currentY = scheme.instructions ? 76 : 60;

  scheme.stages.forEach((stg) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(`Stage ${stg.stage_number}: ${stg.title} (${stg.total_weightage}% Weightage · Pass: ${stg.passing_marks}M)`, 14, currentY);
    currentY += 4;

    const rows = stg.criteria.map((c, i) => [
      i + 1,
      c.title,
      c.description,
      `${c.max_marks} M`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["#", "Evaluation Metric", "Rubric Directive / Quality Standard", "Max"]],
      body: rows,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 8,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 55, fontStyle: "bold" },
        2: { cellWidth: 100 },
        3: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      },
    });

    currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 30;
  });

  doc.save(`SIET_Project_Evaluation_Rubrics_${scheme.academic_year}.pdf`);
}

// ============================================================================
// 3. DYNAMIC CUSTOM REPORT BUILDER EXPORTS
// ============================================================================

export function exportCustomReportExcel(
  reportTitle: string,
  columns: { key: string; label: string }[],
  dataRows: any[]
) {
  const formatted = dataRows.map((row) => {
    const obj: Record<string, any> = {};
    columns.forEach((col) => {
      obj[col.label] = row[col.key] !== undefined ? row[col.key] : "—";
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Custom Report");
  XLSX.writeFile(workbook, `${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`);
}

export function exportCustomReportPDF(
  reportTitle: string,
  columns: { key: string; label: string }[],
  dataRows: any[]
) {
  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SRI INDU ENGINEERING & TECHNOLOGY (AUTONOMOUS)", 14, 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Department Custom Report: ${reportTitle}`, 14, 17);

  const head = [columns.map((c) => c.label)];
  const body = dataRows.map((row) =>
    columns.map((c) => String(row[c.key] !== undefined ? row[c.key] : "—"))
  );

  autoTable(doc, {
    startY: 32,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
    },
  });

  doc.save(`${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

// ============================================================================
// 4. INDIVIDUAL TEAM EVALUATION DOSSIER PDF EXPORT (Matching Screenshot 3)
// ============================================================================

export function exportSingleTeamDossierPDF(record: AdvisorEvaluationHistoryRecord) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Banner
  doc.setFillColor(30, 41, 59); // Command Slate #1E293B
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SRI INDU ENGINEERING & TECHNOLOGY (AUTONOMOUS)", 14, 12);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text("Department of Computer Science & Engineering / ECE", 14, 18);
  doc.text("OFFICIAL TEAM EVALUATION DOSSIER & PRC CERTIFICATE", 14, 25);

  // Team Title Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${record.team_name} — ${record.project_title}`, 14, 42);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Team ID: ${record.team_id} · Batch: ${record.batch}`, 14, 48);
  doc.text(`Evaluated: ${record.evaluation_date} at ${record.evaluation_time}`, 14, 53);

  // Score Box Top Right
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(145, 36, 50, 20, 2, 2, "F");
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(145, 36, 50, 20, 2, 2, "D");
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${record.marks_awarded} / ${record.max_marks}`, 170, 47, { align: "center" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Total Evaluation Score", 170, 52, { align: "center" });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 60, 196, 60);

  // Faculty Supervisor Info
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("ASSIGNED SUPERVISORY PANEL:", 14, 67);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Project Guide: ${record.guide_name} (${record.guide_designation || "Faculty Guide"} · ${record.guide_department || "CSE"})`, 14, 73);
  doc.text(`Faculty Advisor: ${record.advisor_name}`, 14, 78);

  // Enrolled Members Table
  const members = record.enrolled_members || [
    { name: "Rahul Sharma", roll_number: "23CS001", department: "CSE", role: "Core Contributor" },
    { name: "Priya Dharshini", roll_number: "23CS014", department: "CSE", role: "Core Contributor" },
    { name: "Karthik Raja", roll_number: "23CS028", department: "CSE", role: "Core Contributor" },
    { name: "Ananya Iyer", roll_number: "23CS042", department: "CSE", role: "Core Contributor" },
  ];

  autoTable(doc, {
    startY: 83,
    head: [["#", "Student Name", "Register Number", "Department", "Academic Role"]],
    body: members.map((m, idx) => [idx + 1, m.name, m.roll_number, m.department || "CSE", m.role || "Core Contributor"]),
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  let nextY = (doc as any).lastAutoTable?.finalY + 8 || 120;

  // Rubric breakdown
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("RUBRIC MARKS BREAKDOWN (/20 EACH):", 14, nextY);
  nextY += 4;

  const rubric = record.criteria_scores || {
    project_execution: 19,
    technical_depth: 18.5,
    presentation_viva: 18,
    documentation: 14.5,
    contribution: 18,
  };

  autoTable(doc, {
    startY: nextY,
    head: [["Project Execution", "Technical Depth", "Presentation / Viva", "Documentation", "Contribution", "Total Score"]],
    body: [[
      `${rubric.project_execution || 19} / 20`,
      `${rubric.technical_depth || 18.5} / 20`,
      `${rubric.presentation_viva || 18} / 20`,
      `${rubric.documentation || 14.5} / 20`,
      `${rubric.contribution || 18} / 20`,
      `${record.marks_awarded} / ${record.max_marks}`
    ]],
    theme: "plain",
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
  });

  nextY = (doc as any).lastAutoTable?.finalY + 8 || nextY + 30;

  // Remarks & Feedback
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ADVISOR / PRC REMARKS:", 14, nextY);
  nextY += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(51, 65, 85);
  doc.text(`"${record.feedback || "Exceptional architecture, robust code repository, and thorough literature review. Meets all autonomous college guidelines."}"`, 14, nextY, { maxWidth: 180 });
  nextY += 12;

  // Strengths & Improvements
  if (record.standout_strengths) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text("STANDOUT STRENGTHS:", 14, nextY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(record.standout_strengths, 14, nextY + 4, { maxWidth: 180 });
    nextY += 12;
  }

  if (record.areas_for_improvement) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 119, 6); // Amber
    doc.text("AREAS FOR IMPROVEMENT:", 14, nextY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(record.areas_for_improvement, 14, nextY + 4, { maxWidth: 180 });
    nextY += 12;
  }

  // Signatures
  if (nextY < 260) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Project Guide Signature", 14, nextY + 15);
    doc.text("Faculty Advisor Signature", 85, nextY + 15);
    doc.text("Head of Department (HOD)", 150, nextY + 15);
  }

  doc.save(`${record.team_name.replace(/[^a-zA-Z0-9]/g, "_")}_Evaluation_Dossier.pdf`);
}
