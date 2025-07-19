// src/hooks/useHouseVotes.js
import { useEffect, useState, useRef } from 'react';
import {
  setUserVote,
  subscribeToVotes,
  clearAllUserVotes,
} from '../firebase/voteService';

export const allowedUsers = [
  'alexis', 'jay', 'eric', 'sania', 'kendall',
  'awan', 'andreas', 'alaysia', 'carmen',
  'yazmeir', 'jaden', 'delaney'
];

const userAliasMap = {
  cita: 'carmen',
};

export const normalizeUserKey = (name) => {
  const raw = name?.trim().toLowerCase();
  return userAliasMap[raw] || raw || '';
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

    // Load fallback from localStorage
    const cached = localStorage.getItem(getLocalKey(userKey));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setVoted(parsed);
          votedRef.current = parsed;
        }
      } catch {}
    }

    const unsubscribe = subscribeToVotes('house', (data) => {
      const historyByUser = {};
      const voteCounts = {};

      for (const [user, history] of Object.entries(data || {})) {
        if (!Array.isArray(history) || history.length === 0) continue;

        const latest = history[history.length - 1];
        if (!('ids' in latest)) continue;


        latest.ids.forEach((id) => {
          voteCounts[id] = (voteCounts[id] || 0) + 1;
        });

        historyByUser[user] = history;
      }

      setVotes(voteCounts);
      setVoteHistory(historyByUser[userKey] || []);

      const last = historyByUser[userKey]?.at(-1);
      const ids = Array.isArray(last?.ids) ? last.ids : [];

      // Sync state + cache
      setVoted(ids);
      votedRef.current = ids;
      localStorage.setItem(getLocalKey(userKey), JSON.stringify(ids));
    });

    return () => unsubscribe();
  }, [userKey]);

  const handleVote = async (houseId, votingClosed) => {
    if (votingClosed || !allowedUsers.includes(userKey)) return;

    const alreadyVoted = voted.includes(houseId);
    const updated = alreadyVoted
      ? voted.filter((id) => id !== houseId)
      : [...voted, houseId];

    setVoted(updated); // UI feedback
    votedRef.current = updated;
    localStorage.setItem(getLocalKey(userKey), JSON.stringify(updated));
    await setUserVote('house', userKey, { ids: updated });
  };

  const handleResetAllVotes = async () => {
    if (!isMaster) return;

    await clearAllUserVotes('house', allowedUsers);
    setVotes({});
    setVoted([]);
    setVoteHistory([]);

    // Clear localStorage for all users
    allowedUsers.forEach((u) => {
      const key = getLocalKey(u);
      localStorage.removeItem(key);
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
