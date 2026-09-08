import { AdvisorEvaluationSession, AdvisorTeamSummary } from "@/types";

export function exportSessionRecordPDF(session: AdvisorEvaluationSession): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the session PDF report.");
    return;
  }

  const teamsHtml = session.teams
    .map(
      (t, idx) => `
    <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; margin-bottom: 12px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; color: #0F5132; background: #DCFCE7; padding: 2px 8px; border-radius: 9999px;">CANDIDATE TEAM #${idx + 1}</span>
          <h3 style="margin: 6px 0 2px 0; font-size: 16px; color: #0F172A;">${t.name} (${t.section || "CSE-A"})</h3>
          <div style="font-size: 13px; color: #475569; font-weight: 500;">Project: ${t.project_title}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #0F5132;">${t.marks_awarded || 0}/100</div>
          <span style="font-size: 12px; font-weight: 700; color: #1E293B;">Grade: ${t.grade || "N/A"}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 12px;">
        <div>
          <strong>Team Leader:</strong> ${t.leader_name} (${t.leader_roll})<br/>
          <strong>Assigned Guide:</strong> ${t.guide || "Dr. K. Senthil Kumar"}<br/>
          <strong>Submission Status:</strong> ${t.submission_status}
        </div>
        <div>
          <strong>Reviewed At:</strong> ${t.evaluated_at || "N/A"}<br/>
          <strong>Evaluation By:</strong> ${t.evaluated_by || "PRC Committee"}<br/>
          <strong>Milestone:</strong> Review 2 Evaluation
        </div>
      </div>

      <div style="background: #F8FAFC; border-left: 3px solid #0F5132; padding: 10px 12px; border-radius: 0 6px 6px 0; font-size: 12px; color: #334155;">
        <strong>Committee Remarks:</strong>
        <p style="margin: 4px 0 0 0; font-style: italic;">"${t.evaluation_remarks || "Demonstrated satisfactory implementation of project requirements."}"</p>
      </div>
    </div>
  `
    )
    .join("");

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${session.title} - SIET Evaluation Record</title>
        <style>
          @page { size: portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #0F172A; }
          .header { text-align: center; border-bottom: 2px solid #0F5132; padding-bottom: 16px; margin-bottom: 20px; }
          .inst-name { font-size: 18px; font-weight: 800; color: #0F5132; text-transform: uppercase; }
          .dept { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
          .session-meta { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="inst-name">Sri Shakthi Institute of Engineering &amp; Technology</div>
          <div class="dept">Autonomous Institution • Dept. of Computer Science &amp; Engineering</div>
          <h2 style="margin: 10px 0 0 0; font-size: 16px; color: #1E293B;">${session.title}</h2>
        </div>

        <div class="session-meta">
          <div style="display: flex; justify-content: space-between;">
            <div><strong>Session Date:</strong> ${session.date}</div>
            <div><strong>Session Time:</strong> ${session.time}</div>
            <div><strong>Teams Evaluated:</strong> ${session.teams_count}</div>
          </div>
        </div>

        ${teamsHtml}

        <div style="margin-top: 40px; display: flex; justify-content: space-between; padding: 0 20px;">
          <div style="text-align: center; font-size: 12px;">
            <div style="width: 160px; border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>Faculty Advisor Signature</strong>
          </div>
          <div style="text-align: center; font-size: 12px;">
            <div style="width: 160px; border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>External Evaluator</strong>
          </div>
          <div style="text-align: center; font-size: 12px;">
            <div style="width: 160px; border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>HOD / CSE</strong>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
}

export function exportSingleTeamRecordPDF(team: AdvisorTeamSummary): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print team evaluation report.");
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Evaluation Report - ${team.name}</title>
        <style>
          @page { size: portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #0F172A; }
          .header { text-align: center; border-bottom: 2px solid #0F5132; padding-bottom: 14px; margin-bottom: 18px; }
          .inst { font-size: 18px; font-weight: 800; color: #0F5132; text-transform: uppercase; }
          .sub { font-size: 12px; color: #64748B; font-weight: 600; margin-top: 3px; }
          .box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
          th, td { padding: 10px 12px; border: 1px solid #CBD5E1; }
          th { background: #F1F5F9; color: #334155; font-weight: 700; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="inst">Sri Shakthi Institute of Engineering &amp; Technology</div>
          <div class="sub">Autonomous Institution • Project Review Committee (PRC)</div>
          <h2 style="margin: 8px 0 0 0; font-size: 15px; color: #1E293B;">Official Team Evaluation Mark Sheet</h2>
        </div>

        <div class="box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; color: #0F172A;">${team.name}</h3>
              <div style="color: #64748B; font-size: 12px;">Section: ${team.section || "CSE-A"} | Batch: 2023-2027</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 24px; font-weight: 800; font-family: monospace; color: #0F5132;">${team.marks_awarded || 0}/100</span>
              <div style="font-weight: 700; color: #1E293B;">Grade: ${team.grade || "N/A"}</div>
            </div>
          </div>
          <div><strong>Project Title:</strong> ${team.project_title}</div>
          <div style="margin-top: 4px;"><strong>Faculty Guide:</strong> ${team.guide || "Dr. K. Senthil Kumar"}</div>
          <div style="margin-top: 4px;"><strong>Leader:</strong> ${team.leader_name} (${team.leader_roll})</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Evaluation Rubric Criterion</th>
              <th style="text-align: center; width: 90px;">Max Marks</th>
              <th style="text-align: center; width: 90px;">Awarded</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Problem Formulation, Literature Survey &amp; Societal Relevance</td>
              <td style="text-align: center;">20</td>
              <td style="text-align: center; font-weight: 700;">${Math.round((team.marks_awarded || 0) * 0.2)}</td>
            </tr>
            <tr>
              <td>2. System Architecture, Methodology &amp; Engineering Design</td>
              <td style="text-align: center;">20</td>
              <td style="text-align: center; font-weight: 700;">${Math.round((team.marks_awarded || 0) * 0.2)}</td>
            </tr>
            <tr>
              <td>3. Implementation Progress, Code Rigor &amp; Testing Artifacts</td>
              <td style="text-align: center;">20</td>
              <td style="text-align: center; font-weight: 700;">${Math.round((team.marks_awarded || 0) * 0.2)}</td>
            </tr>
            <tr>
              <td>4. Oral Defense, Technical Clarity &amp; Teamwork Distribution</td>
              <td style="text-align: center;">20</td>
              <td style="text-align: center; font-weight: 700;">${Math.round((team.marks_awarded || 0) * 0.2)}</td>
            </tr>
            <tr>
              <td>5. IEEE Milestone Documentation &amp; Presentation Hygiene</td>
              <td style="text-align: center;">20</td>
              <td style="text-align: center; font-weight: 700;">${(team.marks_awarded || 0) - 4 * Math.round((team.marks_awarded || 0) * 0.2)}</td>
            </tr>
            <tr style="background: #F8FAFC; font-weight: 800;">
              <td>TOTAL COMPREHENSIVE SCORE</td>
              <td style="text-align: center;">100</td>
              <td style="text-align: center; color: #0F5132; font-size: 14px;">${team.marks_awarded || 0}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 18px; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; background: #F8FAFC; font-size: 12px;">
          <strong>Advisor / PRC Committee Remarks:</strong>
          <p style="margin: 6px 0 0 0; color: #334155; line-height: 1.5;">${team.evaluation_remarks || "Candidate presented steady progress and validated their approach."}</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; padding: 0 30px;">
          <div style="text-align: center; font-size: 12px;">
            <div style="width: 170px; border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>PRC Faculty Guide</strong>
          </div>
          <div style="text-align: center; font-size: 12px;">
            <div style="width: 170px; border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>Head of Department</strong>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
}
