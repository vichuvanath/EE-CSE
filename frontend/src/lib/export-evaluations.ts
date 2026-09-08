import { AdvisorTeamSummary } from "@/types";

function getGuideName(guide: any): string {
  if (!guide) return "Dr. K. Senthil Kumar";
  if (typeof guide === "string") return guide;
  return guide.name || guide.full_name || "Dr. K. Senthil Kumar";
}

export function exportEvaluationsToCSV(teams: AdvisorTeamSummary[]): void {
  const headers = [
    "Team Name",
    "Section",
    "Project Title",
    "Faculty Guide",
    "Leader Name",
    "Leader Roll No",
    "Submission Status",
    "Evaluation Status",
    "Marks Awarded (/100)",
    "Grade",
    "Evaluated At",
    "Guide Remarks",
  ];

  const rows = teams.map((t) => [
    `"${(t.name || "").replace(/"/g, '""')}"`,
    `"${t.section || "CSE-A"}"`,
    `"${(t.project_title || "").replace(/"/g, '""')}"`,
    `"${getGuideName(t.guide).replace(/"/g, '""')}"`,
    `"${(t.leader_name || "").replace(/"/g, '""')}"`,
    `"${(t.leader_roll || "").replace(/"/g, '""')}"`,
    `"${t.submission_status || "PENDING"}"`,
    `"${t.evaluation_status || "PENDING"}"`,
    t.marks_awarded !== undefined ? t.marks_awarded : "N/A",
    `"${t.grade || "N/A"}"`,
    `"${(t.evaluated_at || "").replace(/"/g, '""')}"`,
    `"${(t.evaluation_remarks || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `SIET_Project_Evaluation_Marksheet_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEvaluationsToExcel(teams: AdvisorTeamSummary[]): void {
  // Generate XML Spreadsheet 2003 format (native .xls readable by MS Excel & LibreOffice)
  const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Evaluation Marks">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Team Name</Data></Cell>
    <Cell><Data ss:Type="String">Section</Data></Cell>
    <Cell><Data ss:Type="String">Project Title</Data></Cell>
    <Cell><Data ss:Type="String">Faculty Guide</Data></Cell>
    <Cell><Data ss:Type="String">Leader Name</Data></Cell>
    <Cell><Data ss:Type="String">Leader Roll</Data></Cell>
    <Cell><Data ss:Type="String">Submission Status</Data></Cell>
    <Cell><Data ss:Type="String">Evaluation Status</Data></Cell>
    <Cell><Data ss:Type="String">Marks (/100)</Data></Cell>
    <Cell><Data ss:Type="String">Grade</Data></Cell>
    <Cell><Data ss:Type="String">Evaluated At</Data></Cell>
    <Cell><Data ss:Type="String">Guide Remarks</Data></Cell>
   </Row>`;

  const xmlRows = teams
    .map(
      (t) => `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(t.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.section || "CSE-A")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.project_title)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(getGuideName(t.guide))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.leader_name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.leader_roll)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.submission_status)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.evaluation_status)}</Data></Cell>
    <Cell><Data ss:Type="${t.marks_awarded !== undefined ? "Number" : "String"}">${
        t.marks_awarded !== undefined ? t.marks_awarded : "N/A"
      }</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.grade || "N/A")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.evaluated_at || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.evaluation_remarks || "")}</Data></Cell>
   </Row>`
    )
    .join("");

  const xmlFooter = `
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlHeader + xmlRows + xmlFooter], {
    type: "application/vnd.ms-excel",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `SIET_Project_Evaluation_Marksheet_${new Date().toISOString().split("T")[0]}.xls`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEvaluationsToPDF(teams: AdvisorTeamSummary[]): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF print preview.");
    return;
  }

  const rowsHtml = teams
    .map(
      (t, idx) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 600; color: #0F172A;">
        ${escapeXml(t.name)}
        <div style="font-size: 11px; color: #64748B; font-weight: normal;">${escapeXml(t.leader_name)} (${escapeXml(t.leader_roll)})</div>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; max-width: 260px;">
        ${escapeXml(t.project_title)}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569;">
        ${escapeXml(getGuideName(t.guide))}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${
          t.evaluation_status === "COMPLETED" ? "#DCFCE7; color: #166534;" : "#FEF3C7; color: #92400E;"
        }">
          ${t.evaluation_status}
        </span>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center; font-weight: 700; font-family: monospace; font-size: 14px; color: #0F5132;">
        ${t.marks_awarded !== undefined ? `${t.marks_awarded}/100` : "-"}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center; font-weight: 700; color: #0F172A;">
        ${t.grade || "-"}
      </td>
    </tr>
  `
    )
    .join("");

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SIET Evaluation Marksheet Report</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #0F172A; }
          .header { text-align: center; border-bottom: 2px solid #0F5132; padding-bottom: 16px; margin-bottom: 20px; }
          .inst-name { font-size: 20px; font-weight: 800; color: #0F5132; text-transform: uppercase; letter-spacing: 0.5px; }
          .dept { font-size: 13px; color: #475569; margin-top: 4px; font-weight: 600; }
          .report-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-top: 10px; }
          .meta-bar { display: flex; justify-content: space-between; font-size: 12px; color: #64748B; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #F1F5F9; color: #334155; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #CBD5E1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; padding: 0 40px; }
          .sig-box { text-align: center; font-size: 12px; color: #334155; }
          .sig-line { width: 180px; border-bottom: 1px solid #94A3B8; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="inst-name">Sri Shakthi Institute of Engineering &amp; Technology</div>
          <div class="dept">An Autonomous Institution | Department of Computer Science &amp; Engineering</div>
          <div class="report-title">Project Review Committee (PRC) — Consolidated Evaluation Marksheet</div>
        </div>

        <div class="meta-bar">
          <div><strong>Academic Year:</strong> 2026 – 2027 | <strong>Semester:</strong> VII (Final Year B.E.)</div>
          <div><strong>Report Generated:</strong> ${new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">#</th>
              <th>Team &amp; Leader</th>
              <th>Project Title</th>
              <th>Faculty Guide</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center;">Marks</th>
              <th style="text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Faculty Advisor / Guide</strong><br />
            Dr. K. Senthil Kumar
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>PRC Committee Convener</strong><br />
            Dept. Project Coordinator
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Head of Department</strong><br />
            Computer Science &amp; Engg.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
}

function escapeXml(unsafe?: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
