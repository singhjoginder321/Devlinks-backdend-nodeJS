import multer, { StorageEngine } from 'multer';
import path from 'path';

// Define disk storage for multer
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Folder where files will be saved temporarily
  },
  filename: (_req, file, cb) => {
    console.log(file,'file');
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to ensure unique filenames
  },
});

const upload = multer({ storage });

export default upload;
