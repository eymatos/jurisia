import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

interface FileUploadProps {
  casoId: string | number;
  onUploadSuccess: () => void;
}

const FileUpload = ({ casoId, onUploadSuccess }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('archivo', acceptedFiles[0]); 
    formData.append('casoId', casoId.toString());

    try {
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess();
    } catch (err: unknown) {
      let mensajeError = "Error al subir el archivo";
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string } } };
        mensajeError = axiosError.response.data.message || mensajeError;
      }
      setError(mensajeError);
    } finally {
      setUploading(false);
    }
  }, [casoId, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`relative border-2 md:border-4 border-dashed rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-accent bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:border-accent/40 hover:bg-slate-50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Loader2 className="animate-spin text-accent w-8 h-8 md:w-12 md:h-12" />
            <div className="space-y-1">
              <p className="text-slate-900 font-black uppercase tracking-tight md:tracking-widest text-xs md:text-sm">
                Procesando con IA...
              </p>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold px-4">
                Extrayendo texto y analizando plazos legales
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg mb-4 md:mb-6 text-accent transition-transform group-hover:scale-105">
              <Upload className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-base md:text-xl font-black text-slate-900 mb-2 px-2">
              {isDragActive ? '¡Suéltalo ahora!' : 'Cargar documento legal'}
            </h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto text-[11px] md:text-sm leading-relaxed px-4">
              {/* En móviles simplificamos el texto para evitar saturación */}
              <span className="hidden md:inline">Soporta PDFs, Imágenes y Word (Máx 10MB).</span>
              <span className="md:hidden">PDF, Word o Imagen (Máx 10MB).</span>
              <br />
              <span className="text-accent font-black">Escaneo OCR automático activo.</span>
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 md:p-4 bg-red-50 border-2 border-red-100 rounded-xl md:rounded-2xl flex items-start md:items-center gap-3 text-red-600 font-bold text-[11px] md:text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 md:mt-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;