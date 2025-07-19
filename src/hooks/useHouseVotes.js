// src/hooks/useHouseVotes.js
import { useEffect, useState, useRef } from 'react';
import {
  setUserVote,
  subscribeToVotes,
  clearAllUserVotes,
} from '../firebase/voteService';

// ✅ Full lowercase allowed users
export const allowedUsers = [
  'alexis', 'jay', 'eric', 'sania', 'kendall',
  'awan', 'andreas', 'alaysia', 'carmen',
  'yazmeir', 'jaden', 'delaney'
];

const userAliasMap = {
  cita: 'carmen',
};

// ✅ Normalize input name
export const normalizeUserKey = (name) => {
  if (!name || typeof name !== 'string') return '';
  const raw = name.trim().toLowerCase();
  return userAliasMap[raw] || raw;
};

const getLocalKey = (userKey) => `house-vote-${userKey}`;

export const useHouseVotes = (name) => {
  const userKey = normalizeUserKey(name);
  const isMaster = userKey === 'alexis';

  const [votes, setVotes] = useState({});
  const [voteHistory, setVoteHistory] = useState([]);
  const [voted, setVoted] = useState([]);
  const votedRef = useRef([]);

  useEffect(() => {
    if (!userKey) return;

    // Load cached votes
    const cached = localStorage.getItem(getLocalKey(userKey));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setVoted(parsed.map(String));
          votedRef.current = parsed.map(String);
        }
      } catch (err) {
        console.warn('⚠️ Failed to parse local vote cache:', err);
      }
    }

    // ✅ Subscribe and count normalized votes
    const unsubscribe = subscribeToVotes('house', (data) => {
      console.log("📡 Firebase vote snapshot:", data);

      const voteCounts = {};
      const historyByUser = {};

      for (const [rawUser, history] of Object.entries(data || {})) {
        const normUser = normalizeUserKey(rawUser);
        if (!Array.isArray(history) || history.length === 0) continue;

        const latest = history.at(-1);
        if (!Array.isArray(latest?.ids)) continue;

        latest.ids.forEach((id) => {
          const strId = String(id);
          voteCounts[strId] = (voteCounts[strId] || 0) + 1;
        });

        historyByUser[normUser] = history;
      }

      setVotes(voteCounts);
      setVoteHistory(historyByUser[userKey] || []);

      const last = historyByUser[userKey]?.at(-1);
      const ids = Array.isArray(last?.ids) ? last.ids.map(String) : [];

      console.log("🧠 Final parsed votedIds for", userKey, "→", ids);
      setVoted(ids);
      votedRef.current = ids;
      localStorage.setItem(getLocalKey(userKey), JSON.stringify(ids));
    });

    return () => unsubscribe();
  }, [userKey]);

  const handleVote = async (houseId, votingClosed) => {
    if (votingClosed || !allowedUsers.includes(userKey)) {
      console.warn('❌ Vote blocked — closed or unauthorized:', {
        userKey,
        votingClosed,
      });
      return;
    }

    const idStr = String(houseId);
    const alreadyVoted = voted.includes(idStr);
    const updated = alreadyVoted
      ? voted.filter((id) => id !== idStr)
      : [...voted, idStr];

    console.log('🔁 Submitting vote:', {
      userKey,
      updated,
      alreadyVoted,
    });

    setVoted(updated);
    votedRef.current = updated;
    localStorage.setItem(getLocalKey(userKey), JSON.stringify(updated));

    // Don't submit empty vote arrays
    if (updated.length === 0) {
      console.log('🧹 Skipping write — empty vote');
      return;
    }

    await setUserVote('house', userKey, { ids: updated });
  };

  const handleResetAllVotes = async () => {
    if (!isMaster) return;

    await clearAllUserVotes('house', allowedUsers);
    setVotes({});
    setVoted([]);
    setVoteHistory([]);

    allowedUsers.forEach((u) => {
      localStorage.removeItem(getLocalKey(u));
    });
  };

  return {
    votes,
    votedIds: voted,
    voteHistory,
    handleVote,
    handleResetAllVotes,
    allowedUsers,
    isMaster,
  };
};
