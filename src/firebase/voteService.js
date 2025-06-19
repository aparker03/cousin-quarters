import { ref, get, onValue, set, update } from "firebase/database";
import { database } from "./config";

/**
 * Normalize username by trimming and converting to lowercase.
 */
const normalizeUsername = (username) => {
  return username?.trim().toLowerCase() || "";
};

/**
 * Get all votes of a given type (house or rental)
 */
export const getVotes = async (type) => {
  const snapshot = await get(ref(database, `votes/${type}`));
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Save a user's vote as a new entry with a timestamp.
 * Does not overwrite previous votes — adds to the history.
 */
export const setUserVote = async (type, username, voteData) => {
  const key = normalizeUsername(username);
  if (!key) return;

  const timestampedVote = {
    ...voteData,
    timestamp: Date.now()
  };

  const voteRef = ref(database, `votes/${type}/${key}`);
  const existingSnapshot = await get(voteRef);

  if (existingSnapshot.exists()) {
    const history = existingSnapshot.val();
    const updated = Array.isArray(history)
      ? [...history, timestampedVote]
      : [timestampedVote];
    await set(voteRef, updated);
  } else {
    await set(voteRef, [timestampedVote]);
  }
};

/**
 * Subscribe to real-time updates for a vote type (house or rental)
 */
export const subscribeToVotes = (type, callback) => {
  const voteRef = ref(database, `votes/${type}`);
  return onValue(voteRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
};

/**
 * Clears all users’ vote histories for a given type (house or rental).
 * This deletes the full vote history (not just overwrites with an empty array).
 */
export const clearAllUserVotes = async (type, usernames = []) => {
  const updates = {};
  usernames.forEach((name) => {
    const key = normalizeUsername(name);
    updates[`votes/${type}/${key}`] = null;
  });

  await update(ref(database), updates);
};
