import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-5 flex flex-col gap-2 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-[#034419] font-medium transition-colors truncate"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-[#034419] truncate" : "truncate"}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] font-['IBM_Plex_Sans',sans-serif]">
            {title}
          </h1>
          {badge}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {description && (
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeader;
