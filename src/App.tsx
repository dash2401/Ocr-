import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('कृपया फक्त इमेज फाईल निवडा (Please choose an image file only)');
      return;
    }
    setImage(file);
    setError(null);
    setOcrText(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  }, []);

  const handleProcessOCR = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('OCR प्रक्रिया अयशस्वी झाली.');

      const data = await response.json();
      setOcrText(data.text);
    } catch (err: any) {
      setError('ERROR: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!ocrText) return;
    navigator.clipboard.writeText(ocrText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetSelection = () => {
    setImage(null);
    setPreview(null);
    setOcrText(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-700 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="px-8 py-4 bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg text-white">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase">VisionOCR AI</h1>
              <p className="text-[10px] text-blue-100 uppercase tracking-widest font-bold opacity-80">Professional Vision Service</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-green-400" />
                Google Vision AI : Connected
             </div>
             <button 
               onClick={resetSelection}
               className="p-2 text-blue-100 hover:text-white transition-colors"
               title="Reset"
             >
               <RefreshCw size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Intro */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
            मजकूर ओळखणे <br/>
            <span className="text-blue-600">आता झाले सोपे.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
            Google Vision AI तंत्रज्ञानाचा वापर करून तुमच्या कोणत्याही प्रतिमेतील मजकूर (Text) अतिशय अचूकपणे आणि जलद बाहेर काढा.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">१. प्रतिमा निवडा (Select Image)</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
                  relative min-h-[350px] border-2 border-dashed rounded-xl transition-all duration-300
                  ${isDragging ? 'border-blue-400 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-blue-300'}
                  ${preview ? 'border-none bg-white p-0' : ''}
                  flex flex-col items-center justify-center p-8 overflow-hidden group
                `}
              >
                <AnimatePresence mode="wait">
                  {!preview ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center"
                    >
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors duration-500 shadow-sm border border-slate-100">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-slate-700 font-bold mb-1">Click or drag to scan</p>
                      <p className="text-slate-400 text-xs font-medium">Supports PNG, JPG, WebP</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                      >
                        Choose File
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                        className="hidden" 
                        accept="image/*"
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative w-full h-full flex items-center justify-center p-4 bg-slate-50 rounded-xl"
                    >
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-[300px] w-auto rounded shadow-sm object-contain border border-slate-200 bg-white"
                      />
                      <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                         <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider"
                         >
                          Change
                         </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Format</p>
                    <p className="text-sm font-semibold text-slate-700">{image ? image.type.split('/')[1].toUpperCase() : '---'}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mode</p>
                    <p className="text-sm font-semibold text-green-600">High Precision</p>
                 </div>
              </div>

              <button
                 onClick={handleProcessOCR}
                 disabled={!image || isLoading}
                 className={`
                   w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                   ${!image ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-[0.98]'}
                 `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    Extract Text
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mx-6 mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[11px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">२. प्राप्त मजकूर (Extracted Text)</h3>
               {ocrText && (
                 <button 
                   onClick={copyToClipboard}
                   className={`
                     text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-all
                     ${isCopied ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
                   `}
                 >
                   {isCopied ? 'Copied' : 'Copy'}
                 </button>
               )}
            </div>
            
            <div className="p-6">
               <div className="min-h-[350px] bg-slate-50 border border-slate-200 rounded-xl p-6 relative flex flex-col overflow-hidden">
                  {!ocrText && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                       <Type size={48} className="text-slate-400 mb-4" strokeWidth={1.5} />
                       <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                          Your extracted text <br/> will appear here
                       </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex-1 flex flex-col space-y-4 pt-4">
                       <div className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                       <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse delay-75" />
                       <div className="h-3 bg-slate-200 rounded-full w-5/6 animate-pulse delay-150" />
                       <div className="h-3 bg-slate-200 rounded-full w-2/3 animate-pulse delay-300" />
                       <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse delay-500" />
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex-1 overflow-y-auto max-h-[350px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {ocrText}
                      </div>
                    </motion.div>
                  )}
               </div>

               <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                       <ShieldCheck size={12} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vision Engine 1.5</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                     Precision: <span className="text-green-600">98.4%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-12 border-t border-slate-200 mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6">Enterprise Security</p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                सर्व्हर-साइड प्रोसेसिंगमुळे तुमचा डेटा सुरक्षित राहतो. आम्ही कोणतीही प्रतिमा किंवा माहिती कायमस्वरूपी (Permanent) साठवत नाही.
              </p>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6">Service Capabilities</p>
              <ul className="text-[11px] text-slate-500 space-y-3 font-bold uppercase tracking-wider">
                 <li className="flex items-center gap-3 text-blue-600"><Check size={14} /> Multi-Language OCR</li>
                 <li className="flex items-center gap-3 text-blue-600"><Check size={14} /> Handwriting Detection</li>
                 <li className="flex items-center gap-3 text-blue-600"><Check size={14} /> Low-Light Correction</li>
              </ul>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6">Extension Status</p>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-700 font-bold mb-2">Browser Extension Ready</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  तुम्ही ही सेवा सरळ तुमच्या क्रोम ब्राउजरमध्ये वापरू शकता.
                </p>
              </div>
           </div>
        </div>
        <div className="mt-12 flex justify-between items-center opacity-30">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-2">
               Vision OCR <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </h1>
            <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">© 2026 Professional AI Services</p>
        </div>
      </footer>
    </div>
  );
}
