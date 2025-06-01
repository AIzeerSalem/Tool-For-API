import { CacheService } from './cacheService';
import { StorageService } from './storageService';
import { LoggingService } from './loggingService';

export const cacheService = new CacheService();
export const storageService = new StorageService();
export const loggingService = new LoggingService();

// Initialize services
const services = {
  cache: cacheService,
  storage: storageService,
  logging: loggingService,
};

export default services; 