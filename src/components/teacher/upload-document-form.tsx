"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { cn } from "../utils";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { createClient } from "../../lib/supabase/browser";
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Image as ImageIcon, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG'
};

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().optional(),
  price: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FileWithStatus {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface UploadDocumentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onItemUploaded?: (document: any) => void;
}

const GRADES = [
  "1ère année primaire",
  "2ème année primaire",
  "3ème année primaire",
  "4ème année primaire",
  "5ème année primaire",
  "6ème année primaire",
  "7ème année de base",
  "8ème année de base",
  "9ème année de base",
  "1ère année secondaire",
  "2ème année secondaire",
  "3ème année secondaire",
  "Baccalauréat"
];

const SUBJECTS = [
  "Français",
  "Anglais",
  "Mathématiques",
  "Physique",
  "Sciences"
];

export function UploadDocumentForm({ onSuccess, onCancel, onItemUploaded }: UploadDocumentFormProps) {
  const { connectedUser, role, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isGlobalUploading, setIsGlobalUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: GRADES[0],
      subject: SUBJECTS[0],
    }
  });

  // --- File Handling ---

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "Fichier trop volumineux (> 50Mo)";
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) return "Format non supporté";
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const processed = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0,
      error: validateFile(file) || undefined
    }));
    
    setFiles(prev => {
      const existingKeys = new Set(prev.map(p => `${p.file.name}-${p.file.size}`));
      const uniqueNew = processed.filter(p => !existingKeys.has(`${p.file.name}-${p.file.size}`));
      return [...uniqueNew, ...prev]; // Prepend new files
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- Drag & Drop Handlers ---

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  // --- Upload Logic (Queue & Concurrency) ---

  const processUploadQueue = async (formData: FormValues) => {
    if (!isAuthenticated || !connectedUser.id || role !== 'teacher') return;
    
    setIsGlobalUploading(true);
    const validFiles = files.filter(f => !f.error && f.status !== 'success');
    
    // Concurrency Limit for high-performance uploading
    const CONCURRENCY_LIMIT = 3;
    const queue = [...validFiles];
    const activeUploads = new Set<Promise<void>>();

    const uploadFile = async (fileObj: FileWithStatus) => {
      let interval: NodeJS.Timeout;
      try {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 5 } : f));

        const fileExt = fileObj.file.name.split('.').pop();
        const cleanName = fileObj.file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const storagePath = `${connectedUser.id}/${crypto.randomUUID()}-${cleanName}.${fileExt}`;

        // Simulated progress for better UX
        interval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileObj.id && f.status === 'uploading') {
              return { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) };
            }
            return f;
          }));
        }, 500);

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('docs')
          .upload(storagePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false,
          });

        clearInterval(interval);
        if (uploadError) throw uploadError;

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: 95 } : f));

        // 2. Insert to DB
        const { data: insertedDoc, error: dbError } = await supabase.from('documents').insert({
          teacher_id: connectedUser.id,
          title: files.length > 1 ? `${formData.title} - ${fileObj.file.name}` : formData.title,
          description: formData.description,
          price: 0, // Forced to 0 for now as it's coming soon
          storage_path: storagePath,
          file_type: fileObj.file.type,
          file_size: fileObj.file.size,
          status: 'draft',
          metadata: {
            grade: formData.grade,
            subject: formData.subject,
            original_name: fileObj.file.name
          }
        }).select().single();

        if (dbError) {
          await supabase.storage.from('docs').remove([storagePath]); // Compensating transaction
          throw dbError;
        }

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
        
        // Notify parent to live load the new item
        if (onItemUploaded && insertedDoc) {
          onItemUploaded(insertedDoc);
        }

      } catch (err: any) {
        if (interval!) clearInterval(interval);
        console.error("[Upload Error]:", err);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: "Échec de l'upload" } : f));
      }
    };

    // Process the queue with concurrency control
    while (queue.length > 0 || activeUploads.size > 0) {
      while (queue.length > 0 && activeUploads.size < CONCURRENCY_LIMIT) {
        const file = queue.shift();
        if (file) {
          const promise = uploadFile(file).then(() => {
            activeUploads.delete(promise);
          });
          activeUploads.add(promise);
        }
      }
      if (activeUploads.size > 0) {
        await Promise.race(activeUploads);
      }
    }

    setIsGlobalUploading(false);
    
    // If we have successful files, trigger overall success
    const finalSuccessCount = files.filter(f => f.status === 'success').length;
    if (finalSuccessCount > 0) {
        toast.success(`${finalSuccessCount} document(s) publié(s) avec succès !`);
        setTimeout(() => onSuccess?.(), 500);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('zip')) return <Archive className="h-4 w-4 text-yellow-500" />;
    if (type.includes('image')) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const pendingCount = files.filter(f => f.status === 'pending' && !f.error).length;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(processUploadQueue)} className="space-y-4">
        {/* Compact Metadata Fields */}
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Input 
              {...register("title")} 
              placeholder="Titre de la série (ex: Maths Révisions)"
              className={cn("h-9 text-sm", errors.title && "border-red-500")}
              disabled={isGlobalUploading}
            />
            {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select 
              {...register("grade")} 
              className="flex h-9 w-full rounded-md border border-black/10 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGlobalUploading}
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select 
              {...register("subject")} 
              className="flex h-9 w-full rounded-md border border-black/10 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGlobalUploading}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative group">
            <Input 
              {...register("price")} 
              placeholder="Prix (TND)" 
              className="h-9 text-sm blur-[2px] pointer-events-none select-none" 
              disabled={true} 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Coming Soon</span>
            </div>
          </div>

          <textarea
            {...register("description")}
            className="min-h-[60px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
            placeholder="Description (optionnel)..."
            disabled={isGlobalUploading}
          />
        </div>

        {/* Slim Upload Zone */}
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group bg-accent/5",
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/10",
              isGlobalUploading && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex items-center gap-3 px-4">
              <UploadCloud className={cn("w-5 h-5", isDragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <div className="text-left">
                <p className="text-sm font-medium">
                  <span className="text-primary">Cliquez</span> ou glissez vos fichiers
                </p>
                <p className="text-[10px] text-muted-foreground">PDF, ZIP, Images (max 50Mo)</p>
              </div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.zip,.png,.jpg,.jpeg"
            />
          </div>

          {/* Compact File List */}
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {files.map((file) => (
                <motion.div
                  layout
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "relative flex flex-col gap-1.5 p-2 rounded-lg border bg-card transition-colors",
                    file.status === 'error' || file.error ? "border-red-200 bg-red-50/50" : "border-border",
                    file.status === 'success' && "border-green-200 bg-green-50/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">{getFileIcon(file.file.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium truncate pr-2">{file.file.name}</p>
                        {file.status === 'error' || file.error ? (
                          <span className="text-[10px] text-red-600 font-medium">{file.error}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(1)}MB</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-5 h-5">
                      {file.status === 'pending' && !isGlobalUploading && (
                        <button type="button" onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {file.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      {file.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {(file.status === 'error' || file.error) && !isGlobalUploading && (
                        <button type="button" onClick={() => removeFile(file.id)} className="text-red-500"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </div>
                  {(file.status === 'uploading' || file.status === 'success') && (
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full", file.status === 'success' ? "bg-green-500" : "bg-primary")}
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-[10px] text-muted-foreground">
            {isGlobalUploading && <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Transfert...</span>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isGlobalUploading}>Annuler</Button>
            <Button type="submit" size="sm" disabled={isGlobalUploading || pendingCount === 0} className="min-w-[100px]">
              {isGlobalUploading ? 'Envoi...' : `Publier ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
