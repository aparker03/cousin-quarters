import houses from '../data/houses.json';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate, useOutletContext } from 'react-router-dom';

function HouseSelection() {
  const { appUsername } = useOutletContext();
  const navigate = useNavigate();

  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem('cq-vote-counts');
    return saved ? JSON.parse(saved) : {};
  });

  const [votedIds, setVotedIds] = useState(() => {
    const saved = localStorage.getItem('cq-votes');
    return Array.isArray(saved) ? [] : JSON.parse(saved) || [];
  });

  const username = appUsername;
  const isMaster = username?.trim().toLowerCase() === 'alexis';

  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingClosed, setVotingClosed] = useState(false);

  const totalVoters = 11;
  const votingDeadline = new Date('2025-06-21T23:59:59');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = votingDeadline - now;

      if (diff <= 0) {
        setVotingClosed(true);
        setTimeRemaining('Voting is closed');
        setTimeout(() => navigate('/results'), 3000);
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
    localStorage.setItem('cq-votes', JSON.stringify(votedIds));
    localStorage.setItem('cq-vote-counts', JSON.stringify(votes));
  }, [votes, votedIds]);

  const handleVote = (houseId) => {
    if (votingClosed) return;

    const alreadyVoted = votedIds.includes(houseId);

    const updatedVotes = {
      ...votes,
      [houseId]: alreadyVoted
        ? (votes[houseId] || 1) - 1
        : (votes[houseId] || 0) + 1,
    };

    const updatedIds = alreadyVoted
      ? votedIds.filter((id) => id !== houseId)
      : [...votedIds, houseId];

    setVotes(updatedVotes);
    setVotedIds(updatedIds);

    if (!alreadyVoted) {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const getPerPersonCost = (total) => (total / totalVoters).toFixed(2);
  const getTopVoteCount = () => Math.max(...Object.values(votes), 0);
  const sortedHouses = [...houses].sort(
    (a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)
  );

  return (
    <>
      <h1 className="section-title">🏡 House Selection</h1>
      <p className="text-sm text-gray-500 mb-6">{timeRemaining}</p>

      {!username ? (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-6">
          <strong>Enter your name</strong> to vote and see the house options.
        </div>
      ) : (
        <>
          {isMaster && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded mb-6 text-sm">
              <strong>Master access:</strong> You have control features here.
              (Override coming soon.)
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {sortedHouses.map((house) => {
              const topVotes = getTopVoteCount();
              const isTop = (votes[house.id] || 0) === topVotes && topVotes > 0;
              const isVoted = votedIds.includes(house.id);

              return (
                <div
                  key={house.id}
                  className={`border rounded-lg p-4 shadow hover:shadow-lg transition ${
                    isTop ? 'border-yellow-400 border-2' : ''
                  }`}
                >
                  <img
                    src={house.image}
                    alt={house.nickname}
                    className="rounded-md mb-3 w-full h-48 object-cover"
                  />
                  <h2 className="text-xl font-semibold text-purple-800">
                    {house.nickname}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">{house.summary}</p>
                  <p className="text-sm mb-1">
                    <strong>Source:</strong> {house.source}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Bedrooms:</strong> {house.bedrooms}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Total Cost:</strong> ${house.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Installments:</strong> {house.klarna}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Per Person:</strong> ${getPerPersonCost(house.totalCost)}
                  </p>
                  <a
                    href={house.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View Listing ↗
                  </a>

                  {isVoted && !votingClosed && (
                    <p className="text-xs text-green-600 mt-2">You voted ✅</p>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <button
                      className={`btn-primary ${
                        isVoted || votingClosed
                          ? 'opacity-60 bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => handleVote(house.id)}
                      disabled={votingClosed}
                    >
                      {votingClosed
                        ? 'Voting Closed'
                        : isVoted
                        ? 'Undo Vote'
                        : 'Vote'}
                    </button>
                    <span className="text-sm text-gray-600">
                      Votes: {votes[house.id] || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default HouseSelection;
