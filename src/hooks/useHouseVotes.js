// src/hooks/useHouseVotes.js
import { useEffect, useState } from 'react';
import {
  getVotes,
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

export const useHouseVotes = (name) => {
  const [votes, setVotes] = useState({});       // { houseId: voteCount }
  const [voteHistory, setVoteHistory] = useState([]); // raw list per user
  const [votedIds, setVotedIds] = useState([]);  // current user's vote list
  const [loading, setLoading] = useState(true);

  const userKey = normalizeUserKey(name);
  const isMaster = userKey === 'alexis';

  // ⏬ Subscribe to votes (Realtime)
  useEffect(() => {
    const unsubscribe = subscribeToVotes('house', (data) => {
      const tally = {};
      const history = data[userKey] || [];

      // Count all latest vote sets
      Object.values(data).forEach((entries) => {
        const latest = entries[entries.length - 1];
        if (latest?.ids) {
          latest.ids.forEach((id) => {
            tally[id] = (tally[id] || 0) + 1;
          });
        }
      });

      setVotes(tally);
      setVoteHistory(history);
      const last = history[history.length - 1];
      setVotedIds(Array.isArray(last?.ids) ? last.ids : []);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, [userKey]);

  // 🗳️ Vote toggle
  const handleVote = async (houseId, votingClosed) => {
    if (votingClosed || !allowedUsers.includes(userKey)) return;

    const alreadyVoted = votedIds.includes(houseId);
    const newVote = alreadyVoted
      ? votedIds.filter((id) => id !== houseId)
      : [...votedIds, houseId];

    await setUserVote('house', userKey, {
      ids: newVote
    });
  };

  // 🔄 Reset (admin only)
  const handleResetAllVotes = async () => {
    if (!isMaster) return;
    await clearAllUserVotes('house', allowedUsers);
  };

  return {
    votes,
    votedIds,
    voteHistory,
    handleVote,
    handleResetAllVotes,
    loading,
    allowedUsers,
    isMaster
  };
};
