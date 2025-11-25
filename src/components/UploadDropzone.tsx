import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { parseCSVFile, ParsedCSV } from "../lib/csvUtils";
import { cn } from "../lib/utils";

export interface UploadDropzoneProps {
  onParsed: (data: ParsedCSV) => void;
}

/**
 * Drag-and-drop + file picker for CSV files.
 * - Shows loading / error states.
 * - Only parses locally in the browser.
 */
export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;

      const file = files[0];
      setIsLoading(true);
      setIsDragging(false);

      try {
        const parsed = await parseCSVFile(file);
        setLastFileName(parsed.fileName);
        onParsed(parsed);

        toast.success(`Loaded ${parsed.fileName}`, {
          description: `Detected ${parsed.headers.length} columns and ${parsed.rows.length} rows (preview).`
        });
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to load CSV file.";
        toast.error("CSV error", {
          description: message
        });
      } finally {
        setIsLoading(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const onClickBrowse = () => {
    inputRef.current?.click();
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    handleFiles(event.target.files);
  };

  return (
    <div className="space-y-2">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClickBrowse();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/40 px-4 py-6 text-center text-xs text-muted shadow-lg backdrop-blur-md transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
          isDragging && "border-accent-cyan bg-slate-900/80 shadow-glow-cyan",
          isLoading && "pointer-events-none opacity-80"
        )}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-accent-violet to-accent-cyan text-slate-900 shadow-glow-violet">
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            ) : (
              <CloudUpload className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-100">
              Drop a CSV here or click to browse
            </p>
            <p className="text-[11px] text-muted">
              Up to ~10MB. Data never leaves your browser.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="subtle"
              onClick={onClickBrowse}
              disabled={isLoading}
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Choose file
            </Button>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] text-muted">
              <ShieldCheck className="h-3 w-3 text-accent-mint" />
              <span>Local-only. No uploads.</span>
            </span>
          </div>
          {lastFileName && !isLoading && (
            <p className="mt-2 text-[11px] text-accent-cyan">
              Last loaded: <span className="font-medium">{lastFileName}</span>
            </p>
          )}
        </motion.div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-hidden="true"
          onChange={onInputChange}
        />
      </motion.div>

      <p className="text-[11px] text-muted">
        Tip: for larger files, we&apos;ll only preview the first 200 rows here,
        but the full dataset will still be available for analysis.
      </p>
    </div>
  );
};
