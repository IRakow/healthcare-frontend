import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';

interface PDFExportPanelProps {
  summaryData: Array<{ label: string; value: string }>;
  filename?: string;
}

export const PDFExportPanel: React.FC<PDFExportPanelProps> = ({ summaryData, filename = 'Visit_Summary.pdf' }) => {
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Visit Summary', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Details']],
      body: summaryData.map((item) => [item.label, item.value]),
    });

    doc.save(filename);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Export Visit Summary</h3>
      <p className="text-sm text-muted-foreground mb-4">Generate a PDF document of your most recent AI summary or medical note.</p>
      <Button onClick={exportPDF} className="flex items-center gap-2">
        <FileDown className="w-4 h-4" /> Download PDF
      </Button>
    </motion.div>
  );
};