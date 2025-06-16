import rentals from '../data/rentals.json';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Rentals() {
  const { name: username } = useUser();
  const navigate = useNavigate();

  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem('cq-rental-votes');
    return saved ? JSON.parse(saved) : {};
  });

  const [locked, setLocked] = useState(() => {
    return localStorage.getItem('cq-rental-locked') === 'true';
  });

  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingClosed, setVotingClosed] = useState(false);

  const votingDeadline = new Date('2025-06-21T23:59:59');
  const isMaster = username?.trim().toLowerCase() === 'alexis';

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = votingDeadline - now;

      if (diff <= 0) {
        setVotingClosed(true);
        setTimeRemaining('Voting is closed');
        setTimeout(() => navigate('/rental-results'), 3000);
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
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('cq-rental-votes', JSON.stringify(votes));
  }, [votes]);

  const handleVote = (car) => {
    if (locked || votingClosed) return;

    const type = car.seats >= 7 ? 'seven' : 'five';
    const updatedVotes = {
      ...votes,
      [type]: votes[type] === car.id ? null : car.id,
    };

    setVotes(updatedVotes);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleLockVote = () => {
    const confirmed = window.confirm(
      'Are you sure? Once you lock your vote, you won’t be able to change it.'
    );
    if (confirmed) {
      setLocked(true);
      localStorage.setItem('cq-rental-locked', 'true');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="section-title">🚗 Rental Selection</h1>
      <p className="text-sm text-gray-500 mb-6">{timeRemaining}</p>

      {!username ? (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-6">
          <strong>Enter your name</strong> to vote and see the rental options.
        </div>
      ) : (
        <>
          {isMaster && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded mb-6 text-sm">
              <strong>Master access:</strong> You have control features here.
              (Override coming soon.)
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Pick your favorite car for each group. You can vote for one 5-seater and one 7-seater. When ready, lock your vote!
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {rentals.map((car) => {
              const type = car.seats >= 7 ? 'seven' : 'five';
              const isSelected = votes[type] === car.id;
              const isLocked = locked && isSelected;

              return (
                <div
                  key={car.id}
                  className={`border rounded-lg p-4 shadow transition bg-white ${
                    isLocked ? 'border-green-500 border-2' : ''
                  }`}
                >
                  <img
                    src={car.image}
                    alt={car.nickname}
                    className="rounded-md mb-3 w-full h-40 object-cover"
                  />
                  <h2 className="text-lg font-semibold text-purple-800">
                    {car.nickname}
                  </h2>
                  <p className="text-sm text-gray-600">{car.summary}</p>
                  <p className="text-sm mt-1">
                    <strong>Seats:</strong> {car.seats} | <strong>Bags:</strong> {car.bags}
                  </p>
                  <p className="text-sm">
                    <strong>Total Cost:</strong> ${car.totalCost.toFixed(2)}
                  </p>
                  <a
                    href={car.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    View Rental Site ↗
                  </a>

                  <div className="mt-3 flex justify-between items-center">
                    <button
                      onClick={() => handleVote(car)}
                      disabled={locked || votingClosed}
                      className={`btn-primary ${
                        isSelected ? 'bg-gray-400 hover:bg-gray-500' : ''
                      }`}
                    >
                      {votingClosed
                        ? 'Voting Closed'
                        : locked
                        ? 'Locked'
                        : isSelected
                        ? 'Selected'
                        : 'Vote'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!locked && !votingClosed && (
            <div className="mt-8">
              <button onClick={handleLockVote} className="btn-primary">
                Lock My Vote
              </button>
            </div>
          )}

          {locked && (
            <p className="mt-6 text-green-700 font-medium">
              ✅ Your rental choices are locked in.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Rentals;
