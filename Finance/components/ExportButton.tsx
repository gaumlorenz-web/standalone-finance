import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";
import { exportToExcel, exportToPDF, ExportDataPayload } from "../utils/exportUtils";

interface ExportButtonProps {
  getExportData: () => ExportDataPayload;
  buttonLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

export default function ExportButton({
  getExportData,
  buttonLabel = "Export",
  size = "sm",
  className = ""
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setIsExporting(format);
      const data = getExportData();
      if (format === "excel") {
        await exportToExcel(data);
      } else {
        exportToPDF(data);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded-lg font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        }`}
        title="Export dataset to Excel (.xlsx) or PDF (.pdf)"
      >
        <Download className="h-3.5 w-3.5 text-[#FF6A3D]" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`h-3 w-3 text-[#A8AFB8] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white shadow-2xl ring-1 ring-black/10 border border-[#DFE1DB] z-50 py-1.5 font-['IBM_Plex_Sans'] divide-y divide-[#F1F1ED] animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5">
            <p className="text-[10px] font-bold uppercase font-['IBM_Plex_Mono'] text-[#5C636F]">
              Select Document Format
            </p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={isExporting !== null}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F8F8F6] text-[#1A1D21] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="h-4 w-4 text-[#157A4D]" />
                <div>
                  <div className="font-semibold">Microsoft Excel</div>
                  <div className="text-[10px] text-[#5C636F]">Formatted .xlsx workbook</div>
                </div>
              </div>
              {isExporting === "excel" && <span className="text-[10px] text-[#157A4D] animate-pulse">Exporting...</span>}
            </button>

            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={isExporting !== null}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F8F8F6] text-[#1A1D21] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-[#B53A1E]" />
                <div>
                  <div className="font-semibold">PDF Document</div>
                  <div className="text-[10px] text-[#5C636F]">Corporate report with tables</div>
                </div>
              </div>
              {isExporting === "pdf" && <span className="text-[10px] text-[#B53A1E] animate-pulse">Exporting...</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
