// src/hooks/useNormalizedUser.js
import { useUser } from '../context/UserContext';
import { normalizeUserKey } from './useHouseVotes';

/**
 * Returns both the normalized key (for logic)
 * and the capitalized display name (for UI)
 */
export const useNormalizedUser = () => {
  const { name, originalName, setName, setOriginalName } = useUser();
  const normalizedName = normalizeUserKey(name);

  // Capitalize display name (e.g., jay → Jay, kendall → Kendall)
  const displayName = originalName
    ? originalName.trim().charAt(0).toUpperCase() + originalName.trim().slice(1)
    : '';

  return {
    name: normalizedName,         // normalized for logic
    originalName: displayName,    // capitalized for UI
    setName,
    setOriginalName
  };
};
