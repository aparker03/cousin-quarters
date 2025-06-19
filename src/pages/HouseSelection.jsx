// src/pages/HouseSelection.jsx
import houses from '../data/houses.json';
import { useUser } from '../context/UserContext';
import { useCountdown } from '../hooks/useCountdown';
import { useHouseVotes } from '../hooks/useHouseVotes';

const votingDeadline = new Date('2025-06-21T23:59:59');

function HouseSelection() {
  const { name } = useUser();
  const username = name.trim();

  const { timeRemaining, votingClosed } = useCountdown(votingDeadline, '/results');
  const {
    votes,
    votedIds,
    voteHistory,
    allVoteHistories,
    handleVote,
    handleResetAllVotes,
    isMaster,
    allowedUsers
  } = useHouseVotes(username);

  const userKey = username.toLowerCase();
  const getPerPersonCost = (total) => (total / allowedUsers.length).toFixed(2);
  const getTopVoteCount = () => {
    const voteCounts = Object.values(votes);
    return voteCounts.length > 0 ? Math.max(...voteCounts) : 0;
  };

  const sortedHouses = [...houses].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="section-title">🏡 House Selection</h1>
      <p className="text-sm text-gray-500 mb-6">{timeRemaining}</p>

      {!username ? (
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
                  <h2 className="text-xl font-semibold text-purple-800">{house.nickname}</h2>
                  <p className="text-sm text-gray-600 mb-2">{house.summary}</p>
                  <p className="text-sm mb-1">
                    <strong>Total Cost:</strong> ${house.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm mb-1">
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
                        votingClosed || !allowedUsers.includes(userKey)
                          ? 'opacity-60 bg-gray-400 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => handleVote(house.id, votingClosed)}
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
