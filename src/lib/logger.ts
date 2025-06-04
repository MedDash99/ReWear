const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment && process.env.DEBUG_VERBOSE === "true") {
      console.log("[DEBUG]", ...args);
    }
  }
}; 