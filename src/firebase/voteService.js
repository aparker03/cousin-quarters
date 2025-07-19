// src/services/voteService.js
import { ref, get, onValue, set, update } from "firebase/database";
import { database } from "./config";
import { normalizeUserKey as normalizeUsername } from "../hooks/useHouseVotes";

/**
 * 🔍 Get all votes of a given type (house or rental)
 */
export const getVotes = async (type) => {
  const snapshot = await get(ref(database, `votes/${type}`));
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * ✅ Save a user's vote history with timestamp
 * Appends to array — does not overwrite
 * 🧹 Skips writing if the vote is empty (unvote)
 */
export const setUserVote = async (type, username, voteData) => {
  const key = normalizeUsername(username);
  if (!key) {
    console.warn("❌ No valid userKey in setUserVote. Input was:", username);
    return;
  }

  const timestampedVote = {
    ...voteData,
    timestamp: Date.now(),
  };

  // 🧹 Skip writing if it's an unvote (ids: [])
  if (!Array.isArray(timestampedVote.ids)) {
    console.warn("❌ Vote missing 'ids' array:", timestampedVote);
    return;
  }

  if (timestampedVote.ids.length === 0) {
    console.log("🧹 Skipping write — empty vote (unvote)");
    return;
  }

  const voteRef = ref(database, `votes/${type}/${key}`);

  try {
    const existingSnapshot = await get(voteRef);
    let updatedVotes;

    if (existingSnapshot.exists()) {
      const history = existingSnapshot.val();
      updatedVotes = Array.isArray(history)
        ? [...history, timestampedVote]
        : [timestampedVote];
    } else {
      updatedVotes = [timestampedVote];
    }

    await set(voteRef, updatedVotes);
    console.log("✅ Vote written to Firebase:", key, updatedVotes);
  } catch (err) {
    console.error("🔥 Failed to write vote to Firebase:", err);
  }
};

/**
 * 🔄 Subscribe to real-time updates for a vote type (house or rental)
 */
export const subscribeToVotes = (type, callback) => {
  const voteRef = ref(database, `votes/${type}`);
  return onValue(voteRef, (snapshot) => {
    const data = snapshot.val() || {};
    console.log("🔥 subscribeToVotes triggered:", data);
    callback(data);
  });
};

/**
 * 🧹 Clears vote history for selected users (used by master only)
 */
export const clearAllUserVotes = async (type, usernames = []) => {
  const updates = {};
  usernames.forEach((name) => {
    const key = normalizeUsername(name);
    if (key) {
      updates[`votes/${type}/${key}`] = null;
    }
  });

  await update(ref(database), updates);
  console.log("🧼 Cleared vote histories for:", usernames);
};
