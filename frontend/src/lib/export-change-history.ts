import { AuditLogEvent } from "@/types";

interface ExportHistoryOptions {
  teamFilter?: string;
  categoryFilter?: string;
  dateFilter?: string;
  batch?: string;
  section?: string;
  advisorName?: string;
}

export function exportChangeHistoryPDF(
  logs: AuditLogEvent[],
  options: ExportHistoryOptions = {}
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the official audit history PDF report.");
    return;
  }

  const {
    teamFilter = "All Teams",
    categoryFilter = "All Categories",
    dateFilter = "All Dates",
    batch = "2025 – 2029",
    section = "CSE - A",
    advisorName = "Dr. K. Senthil Kumar, M.E., Ph.D. (Class Advisor)",
  } = options;

  const nowFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tableRowsHtml = logs
    .map(
      (log, idx) => `
    <tr>
      <td style="text-align: center; font-family: monospace; font-size: 11px; padding: 8px 6px; border-bottom: 1px solid #E2E8F0;">${idx + 1}</td>
      <td style="font-family: monospace; font-size: 11px; white-space: nowrap; padding: 8px 6px; border-bottom: 1px solid #E2E8F0; color: #334155;">${log.dateFormatted}</td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #E2E8F0;">
        <strong style="color: #0F172A; font-size: 12px;">${log.teamName}</strong><br/>
        <span style="font-family: monospace; font-size: 10px; color: #64748B;">${log.teamId}</span>
      </td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #E2E8F0;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #DCFCE7; color: #0F5132; border: 1px solid #86EFAC;">
          ${log.category}
        </span>
      </td>
      <td style="padding: 8px 8px; border-bottom: 1px solid #E2E8F0; font-size: 11.5px; color: #1E293B;">
        <div style="font-weight: 600; margin-bottom: 2px;">${log.action}</div>
        <div style="color: #475569; line-height: 1.4;">${log.description}</div>
        ${
          log.fromState && log.toState
            ? `<div style="margin-top: 4px; font-size: 10.5px; font-family: monospace; color: #0F5132; background: #F8FAFC; padding: 3px 6px; border-radius: 4px; border: 1px dashed #CBD5E1;">
                <span style="color: #64748B;">From:</span> ${log.fromState} <span style="font-weight: bold; color: #0F5132;">➔ To:</span> ${log.toState}
              </div>`
            : ""
        }
      </td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #334155;">
        ${log.changedBy}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SIET Autonomous - Project Allocation & Audit History Report</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 landscape; margin: 12mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #0F172A; }
          .header-box { text-align: center; border-bottom: 2.5px solid #0F5132; padding-bottom: 12px; margin-bottom: 14px; }
          .college-name { font-size: 18px; font-weight: 900; color: #0F5132; letter-spacing: 0.5px; text-transform: uppercase; }
          .college-sub { font-size: 11.5px; color: #475569; margin-top: 2px; font-weight: 600; }
          .report-title { font-size: 14px; font-weight: 800; color: #022c22; margin-top: 6px; text-transform: uppercase; background: #F0FDF4; display: inline-block; padding: 4px 14px; border-radius: 4px; border: 1px solid #BBF7D0; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; font-size: 11px; margin-bottom: 14px; }
          .meta-item strong { color: #475569; text-transform: uppercase; font-size: 9.5px; display: block; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #0F5132; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 6px; text-align: left; }
          .sig-container { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; page-break-inside: avoid; }
          .sig-box { text-align: center; border-top: 1.5px solid #0F172A; padding-top: 8px; font-size: 11.5px; }
          .sig-role { font-size: 10px; color: #64748B; font-weight: 600; text-transform: uppercase; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #0F5132; color: white; padding: 10px 16px; margin-bottom: 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 600;">Official SIET Project Allocation & Audit History Report (${logs.length} entries)</span>
          <button onclick="window.print()" style="background: white; color: #0F5132; border: none; padding: 6px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
        </div>

        <div class="header-box">
          <div class="college-name">Sri Shakthi Institute of Engineering and Technology</div>
          <div class="college-sub">Autonomous Institution · Department of Computer Science & Engineering</div>
          <div class="report-title">MAJOR PROJECT ALLOCATION &amp; AUDIT HISTORY REPORT (${batch} ${section})</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <strong>Target Scope</strong>
            ${teamFilter} · ${categoryFilter}
          </div>
          <div class="meta-item">
            <strong>Date Range Scope</strong>
            ${dateFilter}
          </div>
          <div class="meta-item">
            <strong>Generated On</strong>
            ${nowFormatted}
          </div>
          <div class="meta-item">
            <strong>Authorizing Advisor</strong>
            ${advisorName}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 130px;">Date &amp; Time</th>
              <th style="width: 160px;">Team ID &amp; Name</th>
              <th style="width: 130px;">Category</th>
              <th>Description &amp; State Transition (From ➔ To)</th>
              <th style="width: 170px;">Authorized By</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="sig-container">
          <div class="sig-box">
            <strong>Dr. K. Senthil Kumar, M.E., Ph.D.</strong>
            <div class="sig-role">Faculty Class Advisor</div>
          </div>
          <div class="sig-box">
            <strong>Dr. Subramanian, Ph.D.</strong>
            <div class="sig-role">Project Review Committee (PRC) Coordinator</div>
          </div>
          <div class="sig-box">
            <strong>Head of the Department</strong>
            <div class="sig-role">Department of Computer Science &amp; Engineering</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
}
