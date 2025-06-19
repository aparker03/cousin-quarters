// src/hooks/useRentalVotes.js
import { useState, useEffect } from 'react';
import { setUserVote, subscribeToVotes, clearAllUserVotes } from '../firebase/voteService';
import confetti from 'canvas-confetti';

const allowedUsers = [
  'alexis', 'jay', 'eric', 'sania', 'kendall',
  'delaney', 'awan', 'cita', 'jaden', 'yazmere'
];

export function useRentalVotes(username) {
  const userKey = username?.trim().toLowerCase();
  const isMaster = userKey === 'alexis';

  const [votes, setVotes] = useState({ five: {}, seven: {} });
  const [voted, setVoted] = useState({ five: null, seven: null });
  const [voteHistory, setVoteHistory] = useState([]);
  const [allVoteHistories, setAllVoteHistories] = useState({});

  useEffect(() => {
    if (!userKey) return;

    const unsubscribe = subscribeToVotes('rental', (firebaseVotes) => {
      const normalized = Object.fromEntries(
        Object.entries(firebaseVotes || {}).map(([u, arr]) => [u.trim().toLowerCase(), arr])
      );

      const latestVotes = {};
      const historyByUser = {};

      for (const [user, history] of Object.entries(normalized)) {
        if (!Array.isArray(history) || history.length === 0) continue;
        const latest = history[history.length - 1];
        if (!latest) continue;

        latestVotes[user] = latest;
        historyByUser[user] = history;
      }

      const tally = { five: {}, seven: {} };
      for (const { five, seven } of Object.values(latestVotes)) {
        if (five) tally.five[five] = (tally.five[five] || 0) + 1;
        if (seven) tally.seven[seven] = (tally.seven[seven] || 0) + 1;
      }

      setVotes(tally);
      setVoteHistory(historyByUser[userKey] || []);
      setAllVoteHistories(historyByUser);
      setVoted(latestVotes[userKey] || { five: null, seven: null });
    });

    return () => unsubscribe();
  }, [userKey]);

  const castVote = async (car, votingClosed = false) => {
    if (votingClosed || !userKey || !allowedUsers.includes(userKey)) {
      alert("You're not allowed to vote.");
      return;
    }

    const type = car.seats >= 7 ? 'seven' : 'five';
    const current = voted?.[type];
    const updated = {
      ...voted,
      [type]: current === car.id ? null : car.id
    };

    const newVoteEntry = {
      ...updated,
      timestamp: Date.now()
    };

    await setUserVote('rental', userKey, newVoteEntry);
    setVoted(updated);

    if (current !== car.id) {
      confetti({ particleCount: 70, spread: 85, origin: { y: 0.6 } });
    }
  };

  const handleResetAllVotes = async () => {
    if (!isMaster) return;

    await clearAllUserVotes('rental', allowedUsers);
    setVotes({ five: {}, seven: {} });
    setVoteHistory([]);
    setAllVoteHistories({});
    setVoted({ five: null, seven: null });

    alert('All rental votes and history have been reset.');
  };

  return {
    votes,
    voted,
    voteHistory,
    allVoteHistories,
    castVote,
    handleResetAllVotes,
    isMaster,
    allowedUsers
  };
}
