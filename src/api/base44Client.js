import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67f760246ca81efc4355147c", 
  requiresAuth: true // Ensure authentication is required for all operations
});
