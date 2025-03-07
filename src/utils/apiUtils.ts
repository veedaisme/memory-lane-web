/**
 * Utility functions for API URL handling
 */

// Get the base URL from environment variables or use a fallback
export const getBaseUrl = (): string => {
  // Use the environment variable if available
  if (import.meta.env.VITE_APP_BASE_URL) {
    return import.meta.env.VITE_APP_BASE_URL;
  }
  
  // Fallback: Use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Final fallback for SSR or if all else fails
  return '';
};

/**
 * Creates a full URL by combining the base URL with the given path
 */
export const createApiUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  
  // If baseUrl is empty, just return the path with a leading slash
  if (!baseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Ensure path starts with a slash if it doesn't already
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine base URL with path, avoiding double slashes
  const baseWithoutTrailingSlash = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;
    
  return `${baseWithoutTrailingSlash}${normalizedPath}`;
};

/**
 * Creates a URL for static assets
 */
export const createAssetUrl = (assetPath: string): string => {
  // Handle asset paths more safely
  const cleanPath = assetPath.replace(/^\/assets\//, '');
  return createApiUrl(`assets/${cleanPath}`);
}; 