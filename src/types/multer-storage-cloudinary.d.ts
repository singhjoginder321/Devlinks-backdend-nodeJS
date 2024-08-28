import { v2 as CloudinaryV2 } from 'cloudinary';
import { StorageEngine } from 'multer';

declare module 'multer-storage-cloudinary' {
  // Define the type for params with known and unknown properties
  interface Params {
    folder?: string;
    allowed_formats?: string[];
    [key: string]: any; // Allow additional properties
  }

  // Define the interface for CloudinaryStorage options
  export interface CloudinaryStorageOptions {
    cloudinary: CloudinaryV2;
    params?: Params;
  }

  // Define the CloudinaryStorage class which implements StorageEngine
  export class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: any, file: any, cb: (error: any, info?: any) => void): void;
    _removeFile(req: any, file: any, cb: (error: any) => void): void;
  }
}
