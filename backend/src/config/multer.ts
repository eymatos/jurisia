import multer from 'multer';
import path from 'path';
import fs from 'fs';

// En entornos serverless como Vercel, la única ruta con permisos de escritura es /tmp
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? path.join('/tmp', 'uploads') : 'uploads';

// Asegurar que la carpeta exista protegiendo el proceso contra fallos de permisos
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.warn("Aviso: No se pudo crear el directorio de subida inmediatamente:", error);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegurar que exista antes de escribir el archivo
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
            } catch (err) {
                return cb(err as Error, uploadDir);
            }
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Formato: 1705123456789-archivo-legal.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos permitidos (Seguridad)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Error: El servidor solo soporta archivos de imagen, PDF o Word."));
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB por archivo
    fileFilter: fileFilter
});
