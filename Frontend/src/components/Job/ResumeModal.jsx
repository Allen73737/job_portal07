import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaTimes, FaDownload, FaFileWord, FaExpand, FaCompress } from 'react-icons/fa';
import DocViewer, { PDFRenderer } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import * as docx from 'docx-preview';

const ResumeModal = ({ open, onClose, resumeData, resumeFileName, onDownload }) => {
  const [docUrl, setDocUrl] = useState(null);
  const [fileType, setFileType] = useState("pdf");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const docxContainerRef = useRef(null);

  useEffect(() => {
    if (open && resumeData) {
      const bytes = resumeData instanceof Uint8Array ? resumeData : new Uint8Array(resumeData.data || resumeData);
      
      let typeStr = "application/pdf";
      let fType = "pdf";

      if (bytes.length > 4) {
        if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
          typeStr = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          fType = "docx";
        } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
          typeStr = "application/pdf";
          fType = "pdf";
        }
      }

      setFileType(fType);
      
      if (fType === "docx") {
        setDocUrl("loaded");
      } else {
        const blob = new Blob([bytes], { type: typeStr });
        const url = URL.createObjectURL(blob);
        setDocUrl(url);

        return () => URL.revokeObjectURL(url);
      }
    } else {
      setDocUrl(null);
      setIsFullscreen(false); // Reset on close
    }
  }, [open, resumeData]);

  useEffect(() => {
    if (fileType === "docx" && docUrl === "loaded" && docxContainerRef.current && resumeData) {
      const bytes = resumeData instanceof Uint8Array ? resumeData : new Uint8Array(resumeData.data || resumeData);
      const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      
      docx.renderAsync(arrayBuffer, docxContainerRef.current, null, {
        className: "docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: false,
        experimental: true,
        trimXmlDeclaration: true,
        debug: false
      }).catch(err => console.error("DOCX Preview Error:", err));
    }
  }, [fileType, docUrl, resumeData, isFullscreen]); // re-render docx when fullscreen toggles

  if (!open) return null;

  const docs = docUrl && fileType === 'pdf' ? [
    { 
      uri: docUrl, 
      fileName: resumeFileName || "Resume",
      fileType: "pdf"
    }
  ] : [];

  return createPortal(
    <div className={`fixed inset-0 z-[150] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`relative bg-white/10 dark:bg-slate-900/40 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen 
            ? "w-screen h-screen max-w-none rounded-none" 
            : "w-full max-w-5xl h-[90vh] rounded-[2.5rem]"
        }`}
      >
        <div className="px-8 py-5 flex justify-between items-center bg-white/20 dark:bg-slate-950/40 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Resume Viewer</h3>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-2">
              Preview {fileType === 'docx' && <FaFileWord />}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </button>
            {onDownload && (
              <button 
                onClick={onDownload}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-primary-600 dark:text-primary-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Download Resume"
              >
                <FaDownload size={16} />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
        
        <div className={`flex-grow w-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 ${isFullscreen ? 'p-0' : 'p-6 sm:p-8'}`}>
          <div className={`w-full h-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white flex items-center justify-center ${isFullscreen ? 'rounded-none border-none' : 'rounded-3xl'}`}>
            {docUrl && fileType === 'pdf' ? (
              <DocViewer 
                documents={docs} 
                pluginRenderers={[PDFRenderer]} 
                config={{ header: { disableHeader: true } }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : docUrl && fileType === 'docx' ? (
              <div 
                ref={docxContainerRef}
                className="w-full h-full overflow-auto bg-slate-100 dark:bg-slate-900 docx-wrapper"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse mb-4"></div>
                <p className="font-medium">Processing document...</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ResumeModal;
