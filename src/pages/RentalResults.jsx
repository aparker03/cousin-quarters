// src/pages/RentalResults.jsx
import rentals from '../data/rentals.json';
import { useUser } from '../context/UserContext';
import { useRentalVotes } from '../hooks/useRentalVotes';
import { useState } from 'react';

function RentalResults() {
  const { name } = useUser();
  const username = name?.trim().toLowerCase() || '';
  const {
    votes,
    allVoteHistories,
    isMaster
  } = useRentalVotes(username);

  const [expandedUser, setExpandedUser] = useState(null);

  const getRentalById = (id) => rentals.find((r) => r.id === id);

  const sortedByVotes = (type) => {
    const tally = votes?.[type] || {};
    return Object.entries(tally)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        ...getRentalById(id),
        count,
      }))
      .filter((r) => r);
  };

  const topFive = sortedByVotes('five')[0]?.id;
  const topSeven = sortedByVotes('seven')[0]?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8">
      <h1 className="section-title">🚗 Rental Results</h1>
      <p className="text-gray-600 mb-4">
        Final vote counts are displayed below. Each person could vote for one 5-seater and one 7-seater.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['five', 'seven'].map((type) => (
          <div key={type}>
            <h2 className="text-xl font-semibold mb-2">
              {type === 'five' ? '5-Seaters' : '7-Seaters'}
            </h2>
            {sortedByVotes(type).map((car) => (
              <div
                key={car.id}
                className={`border p-4 rounded-lg shadow-sm bg-white mb-3 ${
                  car.id === (type === 'five' ? topFive : topSeven)
                    ? 'border-yellow-400 border-2'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-purple-800">
                      {car.nickname}{' '}
                      {car.id === (type === 'five' ? topFive : topSeven) && (
                        <span className="ml-1">👑</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{car.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Votes: {car.count}</p>
                  </div>
                </div>
                <img
                  src={car.image}
                  alt={car.nickname}
                  className="rounded-md w-full h-36 object-cover"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">📜 Vote History by Person</h2>
      <p className="text-gray-500 text-sm mb-4">
        Click a name to view their vote timeline.
      </p>

      <div className="space-y-3 mb-12">
        {Object.entries(allVoteHistories)
          .sort()
          .map(([user, history]) => {
            const latest = history[history.length - 1] || {};
            const five = getRentalById(latest.five);
            const seven = getRentalById(latest.seven);

            return (
              <div
                key={user}
                className="border rounded p-3 bg-white shadow"
              >
                <div
                  onClick={() =>
                    setExpandedUser(expandedUser === user ? null : user)
                  }
                  className="cursor-pointer flex justify-between items-center"
                >
                  <span className="capitalize font-medium">{user}</span>
                  <span className="text-xs text-gray-500">
                    {five?.nickname || '–'} / {seven?.nickname || '–'}
                  </span>
                </div>
                {expandedUser === user && (
                  <div className="mt-2 pl-3 text-sm text-gray-600 space-y-1">
                    {history.map((entry, i) => {
                      const carFive = getRentalById(entry.five);
                      const carSeven = getRentalById(entry.seven);
                      const time = new Date(entry.timestamp).toLocaleString();
                      return (
                        <div key={i}>
                          <span className="text-xs text-gray-500">{time}:</span>{' '}
                          {carFive?.nickname || '—'} / {carSeven?.nickname || '—'}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default RentalResults;
