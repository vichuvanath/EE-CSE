import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export interface DataTableColumn<T> {
  accessor: keyof T | string;
  title?: React.ReactNode;
  textAlign?: "left" | "center" | "right";
  textAlignment?: "left" | "center" | "right";
  width?: number | string;
  render?: (record: T, index: number) => React.ReactNode;
  hidden?: boolean;
  sortable?: boolean;
  className?: string;
}

export interface DataTableRowExpansion<T> {
  allowMultiple?: boolean;
  expanded?: {
    recordIds: (string | number)[];
    onExpandedChange: (recordIds: (string | number)[]) => void;
  };
  content: (args: {
    record: T;
    recordIndex: number;
    collapse: () => void;
  }) => React.ReactNode;
  trigger?: "row" | "cell" | "never";
  collapseLabel?: string;
  expandLabel?: string;
  /** Duration of the expand/collapse transition in ms. Defaults to 450ms for a smooth feel. */
  transitionDuration?: number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  records: T[];
  idAccessor?: keyof T | ((record: T) => string | number);
  withTableBorder?: boolean;
  withColumnBorders?: boolean;
  striped?: boolean;
  highlightOnHover?: boolean;
  rowExpansion?: DataTableRowExpansion<T>;
  noRecordsText?: string;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
}

interface ExpandableRowContentProps<T> {
  isExpanded: boolean;
  totalColSpan: number;
  content: (props: { record: T; recordIndex: number; collapse: () => void }) => React.ReactNode;
  record: T;
  index: number;
  collapse: () => void;
  duration?: number;
}

/**
 * Animated row container providing a smooth CSS-grid height and opacity transition.
 * Avoids abrupt pop/toggle effects with custom cubic-bezier easing.
 */
function ExpandableRowContent<T>({
  isExpanded,
  totalColSpan,
  content,
  record,
  index,
  collapse,
  duration = 450,
}: ExpandableRowContentProps<T>) {
  const [isMounted, setIsMounted] = useState(isExpanded);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let animFrame: number;
    let timer: ReturnType<typeof setTimeout>;

    if (isExpanded) {
      setIsMounted(true);
      // Wait for next browser paint cycle so transition runs smoothly from 0fr -> 1fr
      animFrame = requestAnimationFrame(() => {
        animFrame = requestAnimationFrame(() => {
          setIsOpen(true);
        });
      });
    } else {
      setIsOpen(false);
      // Keep mounted until transition finishes, then unmount cleanly
      timer = setTimeout(() => {
        setIsMounted(false);
      }, duration + 50);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [isExpanded, duration]);

  if (!isMounted && !isExpanded) {
    return null;
  }

  return (
    <tr className="border-0 p-0">
      <td colSpan={totalColSpan} className="p-0 border-0">
        <div
          style={{
            display: "grid",
            gridTemplateRows: isOpen ? "1fr" : "0fr",
            opacity: isOpen ? 1 : 0,
            transition: `grid-template-rows ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${Math.round(
              duration * 0.85
            )}ms cubic-bezier(0.25, 1, 0.5, 1)`,
          }}
        >
          <div className="overflow-hidden">
            <div className="p-4 sm:p-5 bg-[#F8FDF9] border-y border-emerald-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              {content({
                record,
                recordIndex: index,
                collapse,
              })}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

/**
 * Standardized Mantine-compatible DataTable with Row Expansion
 * Designed for SIET-LMS Academic Portals (HOD, Advisor, Student).
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  records,
  idAccessor = "id",
  withTableBorder = true,
  withColumnBorders = false,
  striped = false,
  highlightOnHover = true,
  rowExpansion,
  noRecordsText = "No records found",
  emptyState,
  className = "",
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  // Internal expansion state if not controlled
  const [internalExpandedIds, setInternalExpandedIds] = useState<
    (string | number)[]
  >([]);

  const isControlled = Boolean(rowExpansion?.expanded);
  const expandedIds = isControlled
    ? rowExpansion!.expanded!.recordIds
    : internalExpandedIds;

  const getRecordId = (record: T, index: number): string | number => {
    if (typeof idAccessor === "function") {
      return idAccessor(record);
    }
    if (record[idAccessor] !== undefined && record[idAccessor] !== null) {
      return record[idAccessor];
    }
    return record.id || record.team_id || record.faculty_id || index;
  };

  const toggleRow = (id: string | number) => {
    const isExpanded = expandedIds.includes(id);
    let nextIds: (string | number)[];

    if (rowExpansion?.allowMultiple) {
      nextIds = isExpanded
        ? expandedIds.filter((item) => item !== id)
        : [...expandedIds, id];
    } else {
      nextIds = isExpanded ? [] : [id];
    }

    if (isControlled) {
      rowExpansion!.expanded!.onExpandedChange(nextIds);
    } else {
      setInternalExpandedIds(nextIds);
    }
  };

  const visibleColumns = columns.filter((col) => !col.hidden);
  const totalColSpan = visibleColumns.length + (rowExpansion ? 1 : 0);
  const transitionDuration = rowExpansion?.transitionDuration ?? 450;

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white ${
        withTableBorder ? "border border-slate-200/90 shadow-none" : ""
      } ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-700 text-left">
          {/* Table Header */}
          <thead className="bg-[#E8F8F0] text-[#034419] font-bold text-[11px] uppercase tracking-wider font-mono border-b border-emerald-200">
            <tr>
              {/* Optional Row Expansion Chevron Column */}
              {rowExpansion && (
                <th className="py-3.5 px-3 w-10 text-center select-none" aria-label="Expand row">
                  <span className="sr-only">Expand</span>
                </th>
              )}

              {visibleColumns.map((col, idx) => (
                <th
                  key={String(col.accessor) || idx}
                  style={{ width: col.width }}
                  className={`py-3.5 px-4 font-bold ${getAlignmentClass(
                    col.textAlignment || col.textAlign
                  )} ${
                    withColumnBorders && idx < visibleColumns.length - 1
                      ? "border-r border-emerald-200/80"
                      : ""
                  } ${col.className || ""}`}
                >
                  {col.title ?? String(col.accessor).toUpperCase().replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/60 font-sans">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="py-12 px-4 text-center text-slate-400 font-medium"
                >
                  {emptyState || noRecordsText}
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const rowId = getRecordId(record, index);
                const isExpanded = expandedIds.includes(rowId);

                const customRowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(record, index)
                    : rowClassName || "";

                const rowBg = isExpanded
                  ? "bg-emerald-50/70 border-b border-emerald-200"
                  : striped && index % 2 === 1
                  ? "bg-slate-50/50"
                  : "bg-white";

                const hoverClass = highlightOnHover ? "hover:bg-emerald-50/40" : "";

                return (
                  <React.Fragment key={String(rowId)}>
                    <tr
                      onClick={() => {
                        onRowClick?.(record, index);
                        if (rowExpansion && rowExpansion.trigger !== "never") {
                          toggleRow(rowId);
                        }
                      }}
                      className={`transition-colors duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${rowBg} ${hoverClass} ${
                        rowExpansion && rowExpansion.trigger !== "never"
                          ? "cursor-pointer select-none"
                          : ""
                      } ${customRowClass}`}
                    >
                      {/* Expansion Chevron Button */}
                      {rowExpansion && (
                        <td className="py-3 px-3 text-center align-middle">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? rowExpansion.collapseLabel || "Collapse row"
                                : rowExpansion.expandLabel || "Expand row"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(rowId);
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                              isExpanded
                                ? "bg-[#16A34A] text-white shadow-2xs rotate-90 scale-105"
                                : "text-emerald-700 hover:bg-emerald-100 hover:text-[#034419] rotate-0 scale-100"
                            }`}
                          >
                            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]" />
                          </button>
                        </td>
                      )}

                      {/* Regular Columns */}
                      {visibleColumns.map((col, cIdx) => {
                        const cellValue = record[col.accessor as keyof T];
                        return (
                          <td
                            key={String(col.accessor) || cIdx}
                            className={`py-3.5 px-4 align-middle ${getAlignmentClass(
                              col.textAlignment || col.textAlign
                            )} ${
                              withColumnBorders && cIdx < visibleColumns.length - 1
                                ? "border-r border-emerald-100/60"
                                : ""
                            }`}
                          >
                            {col.render
                              ? col.render(record, index)
                              : cellValue !== undefined && cellValue !== null
                              ? String(cellValue)
                              : "—"}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Expandable Row Content with Smooth Height & Opacity Transition */}
                    {rowExpansion && (
                      <ExpandableRowContent
                        isExpanded={isExpanded}
                        totalColSpan={totalColSpan}
                        content={rowExpansion.content}
                        record={record}
                        index={index}
                        collapse={() => toggleRow(rowId)}
                        duration={transitionDuration}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
