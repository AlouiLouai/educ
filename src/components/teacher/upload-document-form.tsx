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
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function UploadDocumentForm({ onSuccess, onCancel }: UploadDocumentFormProps) {
  const { connectedUser, role, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isGlobalUploading, setIsGlobalUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
    
    // Filter out duplicates based on name+size (simple check)
    setFiles(prev => {
      const existingKeys = new Set(prev.map(p => `${p.file.name}-${p.file.size}`));
      const uniqueNew = processed.filter(p => !existingKeys.has(`${p.file.name}-${p.file.size}`));
      return [...prev, ...uniqueNew];
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- Drag & Drop ---

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
    
    // Concurrency Limit (3 parallel uploads)
    const CONCURRENCY_LIMIT = 3;
    const queue = [...validFiles];
    const activeUploads = new Set<Promise<void>>();

    const uploadFile = async (fileObj: FileWithStatus) => {
      try {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f));

        const fileExt = fileObj.file.name.split('.').pop();
        const cleanName = fileObj.file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const storagePath = `${connectedUser.id}/${crypto.randomUUID()}-${cleanName}.${fileExt}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('docs')
          .upload(storagePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // 2. Insert to DB
        const { error: dbError } = await supabase.from('documents').insert({
          teacher_id: connectedUser.id,
          title: files.length > 1 ? `${formData.title} - ${fileObj.file.name}` : formData.title,
          description: formData.description,
          price: formData.price ? parseInt(formData.price.replace(/\D/g, "")) : null,
          storage_path: storagePath,
          file_type: fileObj.file.type,
          file_size: fileObj.file.size,
          status: 'draft',
          metadata: {
            grade: formData.grade,
            subject: formData.subject,
            original_name: fileObj.file.name
          }
        });

        if (dbError) {
          // Compensating transaction
          await supabase.storage.from('docs').remove([storagePath]);
          throw dbError;
        }

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
      } catch (err: any) {
        console.error(err);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: "Échec de l'upload" } : f));
      }
    };

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
    
    // If all successful, trigger success
    const allDone = files.every(f => f.status === 'success' || (f.status as any) === 'pending' /* failed items remain pending/error */); 
    // Actually we should check if any errors exist
    if (files.every(f => f.status === 'success')) {
        setTimeout(() => onSuccess?.(), 1000);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('zip')) return <Archive className="h-5 w-5 text-yellow-500" />;
    if (type.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(processUploadQueue)} className="space-y-6">
        {/* Metadata Fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Titre général
            </label>
            <Input 
              {...register("title")} 
              placeholder="Ex: Série Révisions Maths - 6e"
              className={cn(errors.title && "border-red-500")}
              disabled={isGlobalUploading}
            />
            {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Niveau
              </label>
              <Input {...register("grade")} placeholder="Ex: 6e année" disabled={isGlobalUploading} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Matière
              </label>
              <Input {...register("subject")} placeholder="Ex: Mathématiques" disabled={isGlobalUploading} />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prix (TND)
            </label>
            <Input {...register("price")} placeholder="Gratuit ou 10" disabled={isGlobalUploading} />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              {...register("description")}
              className="min-h-[80px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
              placeholder="Description du contenu..."
              disabled={isGlobalUploading}
            />
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Fichiers ({files.length})
          </label>
          
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group overflow-hidden",
              isDragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
              isGlobalUploading && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="p-2 bg-background rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                <span className="text-primary">Cliquez</span> ou glissez vos fichiers
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, ZIP, Images (max 50Mo)
              </p>
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

          {/* File List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "relative flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
                    file.status === 'error' ? "border-red-200 bg-red-50/50" : "border-border",
                    file.status === 'success' && "border-green-200 bg-green-50/50"
                  )}
                >
                  <div className="shrink-0">
                    {getFileIcon(file.file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate pr-2" title={file.file.name}>
                        {file.file.name}
                      </p>
                      {file.status === 'error' ? (
                        <span className="text-xs text-red-600 font-medium">{file.error}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'success') && (
                      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${file.status === 'success' ? 100 : 50}%` }} // Mock progress for now as generic 'upload' doesn't stream easy % without TUS/XHR hook, but we show activity
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 ml-2">
                    {file.status === 'pending' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                        disabled={isGlobalUploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {files.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                Aucun fichier sélectionné
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isGlobalUploading}>
            Fermer
          </Button>
          <Button 
            type="submit" 
            disabled={isGlobalUploading || files.length === 0 || files.some(f => f.status === 'uploading')} 
            className="min-w-[140px]"
          >
            {isGlobalUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              `Envoyer ${files.filter(f => f.status !== 'success').length > 0 ? `(${files.filter(f => f.status !== 'success').length})` : ''}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
