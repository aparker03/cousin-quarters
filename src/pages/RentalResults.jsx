import rentals from '../data/rentals.json';
import { useEffect, useState } from 'react';

function RentalResults() {
  const [votes, setVotes] = useState({ five: [], seven: [] });

  useEffect(() => {
    const allVotes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'cq-rental-votes' || key.startsWith('cq-rental-votes-user')) {
        try {
          const stored = JSON.parse(localStorage.getItem(key));
          allVotes.push(stored);
        } catch {}
      }
    }

    const tally = { five: {}, seven: {} };

    allVotes.forEach((vote) => {
      if (vote.five) tally.five[vote.five] = (tally.five[vote.five] || 0) + 1;
      if (vote.seven) tally.seven[vote.seven] = (tally.seven[vote.seven] || 0) + 1;
    });

    setVotes({
      five: Object.entries(tally.five),
      seven: Object.entries(tally.seven),
    });
  }, []);

  const getTopCarId = (group) => {
    if (votes[group].length === 0) return null;
    return votes[group].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const topFive = getTopCarId('five');
  const topSeven = getTopCarId('seven');

  const displayGroup = (label, group, topId) => {
    const cars = rentals.filter((r) =>
      group === 'seven' ? r.seats >= 7 : r.seats < 7
    );

    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">
          {label} Results
        </h2>
        <div className="space-y-4">
          {cars.map((car) => {
            const count = votes[group].find(([id]) => id === car.id)?.[1] || 0;
            const isTop = car.id === topId;

            return (
              <div
                key={car.id}
                className={`border rounded-md p-4 flex justify-between items-center shadow-sm ${
                  isTop ? 'bg-yellow-50 border-yellow-400 border-2' : 'bg-white'
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">
                    {car.nickname} {isTop && '👑'}
                  </h3>
                  <p className="text-sm text-gray-600">{car.summary}</p>
                  <p className="text-sm mt-1">
                    <strong>Votes:</strong> {count}
                  </p>
                </div>
                <img
                  src={car.image}
                  alt={car.nickname}
                  className="w-28 h-20 object-cover rounded"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="section-title">🗳️ Rental Voting Results</h1>
      {displayGroup('5-Seater Car', 'five', topFive)}
      {displayGroup('7-Seater Car', 'seven', topSeven)}
    </div>
  );
}

export default RentalResults;
