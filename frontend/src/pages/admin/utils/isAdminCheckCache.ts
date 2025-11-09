const CACHE_KEY = "admin-verification-cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCachedIsAdminCheck = (userId: string) => {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}");
    const cached = cache[userId];

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.admin;
    }
    return null;
  } catch {
    return null;
  }
};

export const setCachedIsAdminCheck = (userId: string, admin: any) => {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}");
    cache[userId] = {
      admin,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore errors
  }
};
