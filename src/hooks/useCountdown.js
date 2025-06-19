// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useCountdown(deadline, redirectPath) {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingClosed, setVotingClosed] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setVotingClosed(true);
        setTimeRemaining('Voting is closed');
        setTimeout(() => navigate(redirectPath), 3000);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeRemaining(`Voting closes in ${days}d ${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [deadline, navigate, redirectPath]);

  return { timeRemaining, votingClosed };
}
