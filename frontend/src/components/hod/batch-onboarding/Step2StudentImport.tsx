import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
} from "lucide-react";

export interface ImportedStudentItem {
  id: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  className: string;
  status: "Valid" | "Warning" | "Error";
  validationMessage?: string;
}

interface Step2StudentImportProps {
  students: ImportedStudentItem[];
  availableClasses: string[];
  batchName: string;
  onUpdateStudents: (students: ImportedStudentItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2StudentImport: React.FC<Step2StudentImportProps> = ({
  students,
  availableClasses,
  batchName,
  onUpdateStudents,
  onNext,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Valid" | "Warning" | "Error">("ALL");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editRoll, setEditRoll] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editClass, setEditClass] = useState("");

  // Validate student records
  const validateStudentRows = (rows: Partial<ImportedStudentItem>[]): ImportedStudentItem[] => {
    const rollSet = new Set<string>();

    return rows.map((r, idx) => {
      const roll = (r.rollNumber || "").trim().toUpperCase();
      const name = (r.fullName || "").trim();
      const email = (r.email || "").trim();
      const cls = (r.className || "").trim();

      let status: ImportedStudentItem["status"] = "Valid";
      let msg = "Record valid and ready for cohort assignment.";

      if (!roll) {
        status = "Error";
        msg = "Roll number is missing.";
      } else if (rollSet.has(roll)) {
        status = "Error";
        msg = `Duplicate roll number "${roll}" detected.`;
      } else if (!name) {
        status = "Error";
        msg = "Student name is required.";
      } else if (cls && !availableClasses.includes(cls)) {
        status = "Warning";
        msg = `Class "${cls}" is not defined in this batch. Will default to unassigned.`;
      } else if (!email || !email.includes("@")) {
        status = "Warning";
        msg = "Institutional email missing or non-standard format.";
      }

      if (roll) rollSet.add(roll);

      return {
        id: r.id || `imp-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        rollNumber: roll,
        fullName: name,
        email: email || `${roll.toLowerCase()}@siet.ac.in`,
        phone: r.phone || "",
        className: availableClasses.includes(cls) ? cls : availableClasses[0] || "CSE-A",
        status,
        validationMessage: msg,
      };
    });
  };

  // Handle file parsing using xlsx
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const rawRows: Partial<ImportedStudentItem>[] = json.map((row, i) => {
          // Normalize column names
          const roll = row["Roll Number"] || row["rollNumber"] || row["RollNo"] || row["Register Number"] || row["Roll"] || "";
          const name = row["Student Name"] || row["fullName"] || row["Name"] || "";
          const email = row["Email"] || row["email"] || "";
          const phone = row["Phone"] || row["phone"] || row["Mobile"] || "";
          const cls = row["Class"] || row["Section"] || row["class"] || "";

          return {
            id: `row-${i + 1}`,
            rollNumber: String(roll),
            fullName: String(name),
            email: String(email),
            phone: String(phone),
            className: String(cls),
          };
        });

        const validated = validateStudentRows(rawRows);
        onUpdateStudents(validated);
      } catch (err) {
        alert("Failed to parse file. Please verify it is a valid .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Download official Excel template
  const handleDownloadTemplate = () => {
    const wsData = [
      ["Roll Number", "Student Name", "Email", "Phone", "Class"],
      ["26CSE001", "Arun Kumar", "arunkumar.26cs@siet.ac.in", "9876543210", availableClasses[0] || "CSE-A"],
      ["26CSE002", "Priya S", "priyas.26cs@siet.ac.in", "9876543211", availableClasses[0] || "CSE-A"],
      ["26CSE003", "Rahul K", "rahulk.26cs@siet.ac.in", "9876543212", availableClasses[1] || "CSE-B"],
      ["26CSE004", "Ananya R", "ananya.26cs@siet.ac.in", "9876543213", availableClasses[1] || "CSE-B"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student_Roster");
    XLSX.writeFile(wb, `SIET_${batchName.replace(/\s+/g, "_")}_Student_Template.xlsx`);
  };

  // Load sample dataset of 248 students
  const handleLoadSampleDataset = () => {
    const firstNames = [
      "Aarav", "Aditi", "Akhil", "Ananya", "Arun", "Bhavana", "Deepa", "Dinesh",
      "Divya", "Gokul", "Harish", "Karthik", "Keerthana", "Kishore", "Lavanya",
      "Manoj", "Meera", "Naveen", "Nithya", "Pavithra", "Pooja", "Priya", "Rahul",
      "Ramesh", "Sandhya", "Sanjay", "Saravanan", "Shalini", "Sneha", "Swathi",
      "Venkatesh", "Vignesh", "Vijay", "Yuvraj", "Rohit", "Ishaan", "Sai", "Varun"
    ];
    const lastNames = ["Kumar", "Sharma", "Reddy", "Raja", "Iyer", "Nair", "Patel", "Singh", "Prakash", "Murugan", "Devi", "Babu"];

    const sampleRows: Partial<ImportedStudentItem>[] = [];
    const totalCount = 248;

    for (let i = 1; i <= totalCount; i++) {
      const roll = `26CSE${String(i).padStart(3, "0")}`;
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[i % lastNames.length];
      const cls = availableClasses[(i - 1) % availableClasses.length] || "CSE-A";

      // Introduce controlled edge cases for demonstration
      if (i === 15) {
        // Warning: non-standard email
        sampleRows.push({
          id: `sample-${i}`,
          rollNumber: roll,
          fullName: `${fName} ${lName}`,
          email: "incomplete-email",
          phone: "9876543210",
          className: cls,
        });
      } else if (i === 42) {
        // Error: missing name
        sampleRows.push({
          id: `sample-${i}`,
          rollNumber: roll,
          fullName: "",
          email: `${roll.toLowerCase()}@siet.ac.in`,
          phone: "9876543211",
          className: cls,
        });
      } else if (i === 78) {
        // Warning: unregistered class
        sampleRows.push({
          id: `sample-${i}`,
          rollNumber: roll,
          fullName: `${fName} ${lName}`,
          email: `${roll.toLowerCase()}@siet.ac.in`,
          phone: "9876543212",
          className: "CSE-Z",
        });
      } else {
        sampleRows.push({
          id: `sample-${i}`,
          rollNumber: roll,
          fullName: `${fName} ${lName}`,
          email: `${fName.toLowerCase()}.${roll.toLowerCase()}@siet.ac.in`,
          phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          className: cls,
        });
      }
    }

    const validated = validateStudentRows(sampleRows);
    onUpdateStudents(validated);
  };

  // Handle inline edit
  const startEdit = (st: ImportedStudentItem) => {
    setEditingStudentId(st.id);
    setEditRoll(st.rollNumber);
    setEditName(st.fullName);
    setEditEmail(st.email);
    setEditClass(st.className);
  };

  const saveEdit = (id: string) => {
    const updated = students.map((st) => {
      if (st.id === id) {
        return {
          ...st,
          rollNumber: editRoll.trim().toUpperCase(),
          fullName: editName.trim(),
          email: editEmail.trim(),
          className: editClass,
        };
      }
      return st;
    });
    onUpdateStudents(validateStudentRows(updated));
    setEditingStudentId(null);
  };

  const validCount = students.filter((s) => s.status === "Valid").length;
  const warningCount = students.filter((s) => s.status === "Warning").length;
  const errorCount = students.filter((s) => s.status === "Error").length;

  const filteredList = students.filter((st) => {
    const matchesSearch =
      st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Template Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#034419]" />
              <span>2. Bulk Student Roster Import</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload institutional Excel (.xlsx, .xls) or CSV files containing registered students for {batchName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Excel Template</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleDataset}
              className="px-3 py-1.5 text-xs font-semibold text-[#034419] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Load 248 Sample Students</span>
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#034419] bg-emerald-50/50 scale-[0.99]"
              : "border-slate-300 hover:border-[#034419] bg-slate-50/60 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#034419] flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Drag & Drop Student Excel/CSV File Here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                or click to browse from local computer (.xlsx, .xls, .csv supported)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary & Preview Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          {/* KPI Banner */}
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="text-xs font-bold text-slate-900">
                Student Import Preview ({students.length} Total)
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{validCount} Valid</span>
                </span>
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{warningCount} Warnings</span>
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full flex items-center space-x-1">
                    <XCircle className="w-3 h-3" />
                    <span>{errorCount} Errors</span>
                  </span>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name, roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Status ({students.length})</option>
                <option value="Valid">Valid ({validCount})</option>
                <option value="Warning">Warnings ({warningCount})</option>
                <option value="Error">Errors ({errorCount})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-white border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Validation Message</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredList.slice(0, 100).map((st, idx) => {
                    const isEditing = editingStudentId === st.id;
                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          st.status === "Error"
                            ? "bg-rose-50/40"
                            : st.status === "Warning"
                            ? "bg-amber-50/30"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editRoll}
                              onChange={(e) => setEditRoll(e.target.value)}
                              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs bg-white"
                            />
                          ) : (
                            st.rollNumber || <span className="text-rose-600 italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs bg-white"
                            />
                          ) : (
                            st.fullName || <span className="text-rose-600 italic">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs bg-white"
                            />
                          ) : (
                            st.email
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <select
                              value={editClass}
                              onChange={(e) => setEditClass(e.target.value)}
                              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs bg-white"
                            >
                              {availableClasses.map((cls) => (
                                <option key={cls} value={cls}>
                                  {cls}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium text-[10px]">
                              {st.className}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              st.status === "Valid"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : st.status === "Warning"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                          {st.validationMessage}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => saveEdit(st.id)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Save record"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(st)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Edit and correct row"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredList.length > 100 && (
            <div className="p-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
              Showing first 100 rows for preview performance ({filteredList.length} total matched)
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Batch Details</span>
        </button>

        <div className="flex items-center space-x-3">
          {errorCount > 0 && (
            <span className="text-xs text-rose-700 font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Correct {errorCount} error(s) before proceeding</span>
            </span>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={students.length === 0 || errorCount > 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50 active:scale-95"
          >
            <span>Continue to Class Organization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
