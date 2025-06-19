// src/hooks/useHouseVotes.js
import { useState, useEffect } from 'react';
import { setUserVote, subscribeToVotes, clearAllUserVotes } from '../firebase/voteService';
import confetti from 'canvas-confetti';

const allowedUsers = [
  'alexis', 'jay', 'eric', 'sania', 'kendall',
  'delaney', 'awan', 'cita', 'jaden', 'yazmere'
];

export function useHouseVotes(username) {
  const userKey = username.trim().toLowerCase();
  const isMaster = userKey === 'alexis';

  const [votes, setVotes] = useState({});
  const [votedIds, setVotedIds] = useState([]);
  const [voteHistory, setVoteHistory] = useState([]);
  const [allVoteHistories, setAllVoteHistories] = useState({});

  useEffect(() => {
    if (!username) return;

    const unsubscribe = subscribeToVotes('house', (firebaseVotes) => {
      const normalized = Object.fromEntries(
        Object.entries(firebaseVotes).map(([u, arr]) => [u.trim().toLowerCase(), arr])
      );

      const latestVotes = {};
      const historyByUser = {};

      for (const [user, history] of Object.entries(normalized)) {
        if (!Array.isArray(history) || history.length === 0) continue;
        const latest = history[history.length - 1];
        if (!latest || !Array.isArray(latest.ids)) continue;

        latestVotes[user] = latest.ids;
        historyByUser[user] = history;
      }

      setAllVoteHistories(historyByUser);
      setVoteHistory(historyByUser[userKey] || []);
      setVotedIds(latestVotes[userKey] || []);
      setVotes(countVotes(latestVotes));
    });

    return () => unsubscribe();
  }, [username, userKey]);

  const countVotes = (latestVoteMap) => {
    const tally = {};
    Object.values(latestVoteMap).forEach((ids) => {
      ids.forEach((id) => {
        tally[id] = (tally[id] || 0) + 1;
      });
    });
    return tally;
  };

  const handleVote = async (houseId, votingClosed) => {
    if (votingClosed || !username || !allowedUsers.includes(userKey)) {
      alert("You're not allowed to vote.");
      return;
    }

    const alreadyVoted = votedIds.includes(houseId);
    let updatedIds;

    if (alreadyVoted) {
      updatedIds = votedIds.filter((id) => id !== houseId);
    } else if (votedIds.length >= 3) {
      alert('You can only vote for up to 3 houses.');
      return;
    } else {
      updatedIds = [...votedIds, houseId];
    }

    setVotedIds(updatedIds);

    const newVoteEntry = {
      ids: updatedIds,
      timestamp: Date.now()
    };

    await setUserVote('house', username, newVoteEntry);

    if (!alreadyVoted) {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
  };

  const handleResetAllVotes = async () => {
    if (!isMaster) return;

    await clearAllUserVotes('house', allowedUsers);
    await new Promise((res) => setTimeout(res, 500)); // ✅ small delay

    setVotedIds([]);
    setVoteHistory([]);
    setAllVoteHistories({});
    setVotes({});
    alert('All votes and history have been reset.');
  };


  return {
    votes,
    votedIds,
    voteHistory,
    allVoteHistories,
    handleVote,
    handleResetAllVotes,
    isMaster,
    allowedUsers
  };
}
