import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import houses from '../data/houses.json';

function Results() {
  const [votes, setVotes] = useState({});
  const totalVoters = 11;
  const { appUsername } = useOutletContext();

  useEffect(() => {
    const saved = localStorage.getItem('cq-vote-counts');
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') setVotes(parsed);
    } catch {
      setVotes({});
    }
  }, []);

  const getPerPersonCost = (total) => (total / totalVoters).toFixed(2);

  const sortedHouses = [...houses].sort(
    (a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)
  );

  const topVotes = Math.max(...Object.values(votes), 0);

  return (
    <div>
      <h1 className="section-title">📊 House Voting Results</h1>
      <div className="space-y-4">
        {sortedHouses.map((house) => {
          const voteCount = votes[house.id] || 0;
          const isTop = voteCount === topVotes && topVotes > 0;

          return (
            <div
              key={house.id}
              className={`border p-4 rounded-md shadow flex items-start justify-between ${
                isTop ? 'border-yellow-400 border-2 bg-yellow-50' : 'bg-white'
              }`}
            >
              <div>
                <h2 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  {house.nickname}
                  {isTop && <span>👑</span>}
                </h2>
                <p className="text-sm text-gray-600">{house.summary}</p>
                <p className="text-sm mt-1">
                  <strong>Total:</strong> ${house.totalCost.toLocaleString()} |{' '}
                  <strong>Per Person:</strong> ${getPerPersonCost(house.totalCost)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Votes:</strong> {voteCount}
                </p>
              </div>
              <img
                src={house.image}
                alt={house.nickname}
                className="w-28 h-20 object-cover rounded"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Results;
