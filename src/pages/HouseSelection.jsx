import houses from '../data/houses.json';
import { useNormalizedUser } from '../hooks/useNormalizedUser';
import { useCountdown } from '../hooks/useCountdown';
import { useHouseVotes } from '../hooks/useHouseVotes';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const votingDeadline = new Date('2025-07-21T23:59:59');
const apr = 0.0599; // ~5.99% Klarna APR
const monthlyRate = apr / 12;

function HouseSelection() {
  const { name: userKey, originalName } = useNormalizedUser(); // name = normalized
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('klarna');
  const [months, setMonths] = useState(12);

  const { timeRemaining, votingClosed } = useCountdown(votingDeadline, '/results');
  const {
    votes,
    votedIds,
    handleVote,
    handleResetAllVotes,
    isMaster,
    allowedUsers
  } = useHouseVotes(userKey);

  if (!Array.isArray(allowedUsers) || !votes) {
    return <div className="p-4 text-center text-gray-600">Loading vote data...</div>;
  }

  const numUsers = allowedUsers.length;

  useEffect(() => {
    if (votingClosed && userKey && userKey !== 'alexis') {
      navigate('/results');
    }
  }, [votingClosed, userKey, navigate]);

  const getPerPersonCost = (total) => {
    if (paymentMode === 'klarna') {
      const totalWithInterest = total * Math.pow(1 + monthlyRate, months);
      return (totalWithInterest / numUsers).toFixed(2);
    }
    return (total / numUsers).toFixed(2);
  };

  const getPerPersonMonthly = (total) => {
    if (paymentMode !== 'klarna') return null;
    const totalWithInterest = total * Math.pow(1 + monthlyRate, months);
    return (totalWithInterest / months / numUsers).toFixed(2);
  };

  const getTopVoteCount = () => {
    const voteCounts = Object.values(votes);
    return voteCounts.length > 0 ? Math.max(...voteCounts) : 0;
  };

  const sortedHouses = [...houses].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="section-title">🏡 House Selection</h1>
      <p className="text-sm text-gray-500 mb-4">{timeRemaining}</p>

      <div className="mb-6 space-y-2">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Payment Plan:</label>
          <button
            className={`px-3 py-1 rounded border text-sm ${
              paymentMode === 'full' ? 'bg-purple-600 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setPaymentMode('full')}
          >
            Pay in Full
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm ${
              paymentMode === 'klarna' ? 'bg-purple-600 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setPaymentMode('klarna')}
          >
            Klarna
          </button>
        </div>

        {paymentMode === 'klarna' && (
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Monthly Plan:</label>
            <button
              className={`px-3 py-1 rounded border text-sm ${
                months === 6 ? 'bg-purple-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setMonths(6)}
            >
              6 months
            </button>
            <button
              className={`px-3 py-1 rounded border text-sm ${
                months === 12 ? 'bg-purple-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setMonths(12)}
            >
              12 months
            </button>
          </div>
        )}
      </div>

      {!userKey ? (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-6">
          <strong>Enter your name</strong> to vote and see the house options.
        </div>
      ) : (
        <>
          {!allowedUsers.includes(userKey) && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-6">
              <strong>Access restricted:</strong> Your name is not on the voting list.
            </div>
          )}

          {isMaster && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded mb-6 text-sm">
              <strong>Master access:</strong> You can reset all votes.
              <br />
              <button
                onClick={handleResetAllVotes}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Reset All Votes
              </button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {sortedHouses.map((house) => {
              const topVotes = getTopVoteCount();

              console.log('🏠 House:', house.id, '🗳️ Your votes:', votedIds);

              const isTop = (votes[house.id] || 0) === topVotes && topVotes > 0;
              const isVoted = Array.isArray(votedIds) && votedIds.includes(String(house.id));

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
                  <h2 className="text-xl font-semibold text-purple-800">{house.nickname}</h2>
                  <p className="text-sm text-gray-600 mb-2">{house.summary}</p>

                  <p className="text-sm mb-1">
                    <strong>Total Cost:</strong> ${house.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Per Person:</strong> ${getPerPersonCost(house.totalCost)}
                  </p>

                  {paymentMode === 'klarna' && (
                    <>
                      <p className="text-sm mb-2">
                        <strong>Klarna {months}mo/pp:</strong> ${getPerPersonMonthly(house.totalCost)}
                      </p>
                      <div className="inline-flex items-center text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded mb-2">
                        <img src="/icons/klarna.svg" alt="Klarna" className="w-4 h-4 mr-1" />
                        Klarna estimate includes ~5.99% APR
                      </div>
                    </>
                  )}

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
                        votingClosed || !allowedUsers.includes(userKey)
                          ? 'opacity-60 bg-gray-400 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={async () => {
                        try {
                          const alreadyVoted = votedIds.includes(house.id);
                          await handleVote(house.id, votingClosed, votedIds);

                          setTimeout(() => {
                            console.log('✅ Refreshed votedIds after vote:', votedIds);
                          }, 500);

                          if (!alreadyVoted && !votingClosed) {
                            confetti({
                              particleCount: 80,
                              spread: 70,
                              origin: { y: 0.6 }
                            });
                          }
                        } catch (err) {
                          console.error('❌ Vote failed:', err);
                          alert('Something went wrong while submitting your vote.');
                        }
                      }}
                      disabled={votingClosed || !allowedUsers.includes(userKey)}
                    >
                      {votingClosed ? 'Voting Closed' : isVoted ? 'Undo Vote' : 'Vote'}
                    </button>
                    <span className="text-sm text-gray-600">Votes: {votes[house.id] || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default HouseSelection;
