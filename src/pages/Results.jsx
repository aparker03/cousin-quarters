import { useEffect, useState } from 'react';
import houses from '../data/houses.json';
import { useUser } from '../context/UserContext';
import { getVotes } from '../firebase/voteService';

function Results() {
  const { name } = useUser();
  const isMaster = name?.trim().toLowerCase() === 'alexis';

  const [votes, setVotes] = useState({});
  const [voteHistory, setVoteHistory] = useState({});
  const [voterSummary, setVoterSummary] = useState({ voters: [], missing: [] });

  const KNOWN_USERS = [
    'alexis', 'jay', 'eric', 'sania', 'kendall',
    'delaney', 'awan', 'cita', 'jaden', 'yazmere'
  ];

  useEffect(() => {
    const fetchVotes = async () => {
      const snapshot = await getVotes('house');
      const normalized = Object.fromEntries(
        Object.entries(snapshot).map(([user, voteArray]) => [
          user.trim().toLowerCase(),
          Array.isArray(voteArray) ? voteArray : [voteArray]
        ])
      );

      const latestVotes = {};
      const tally = {};

      for (const [user, history] of Object.entries(normalized)) {
        const last = history[history.length - 1];
        if (!last || !Array.isArray(last.ids)) continue;

        latestVotes[user] = last.ids;

        last.ids.forEach((id) => {
          tally[id] = (tally[id] || 0) + 1;
        });
      }

      setVotes(tally);
      setVoteHistory(normalized);

      const voters = Object.keys(latestVotes);
      const missing = KNOWN_USERS.filter((u) => !voters.includes(u));
      setVoterSummary({ voters, missing });
    };

    fetchVotes();
  }, []);

  const getPerPersonCost = (total) => (total / KNOWN_USERS.length).toFixed(2);

  const sortedHouses = [...houses].sort(
    (a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)
  );

  const topVotes = Math.max(...Object.values(votes), 0);

  const displayVoteHistory = () => (
    <div className="mt-8 text-sm text-gray-700">
      <h2 className="text-base font-bold mb-2">🕓 Vote History (Master Only)</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(voteHistory).map(([user, history]) => (
          <div key={user} className="border rounded p-3 bg-white shadow-sm">
            <h3 className="font-semibold capitalize mb-1">{user}</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              {history.map((entry, idx) => (
                <li key={idx}>
                  🏡 {entry.ids?.join(', ') || '—'} |{' '}
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="section-title">📊 House Voting Results</h1>

      {isMaster && (
        <>
          <div className="mb-6 bg-blue-50 border border-blue-300 p-4 rounded text-sm text-blue-800">
            <h2 className="text-base font-bold mb-2">📋 Voter Summary (Master Only)</h2>
            <p><strong>Total voted:</strong> {voterSummary.voters.length} / {KNOWN_USERS.length}</p>
            <p><strong>Voted:</strong> {voterSummary.voters.join(', ') || 'None yet'}</p>
            <p><strong>Still missing:</strong> {voterSummary.missing.join(', ') || 'All voted 🎉'}</p>
          </div>
          {displayVoteHistory()}
        </>
      )}

      <div className="space-y-4 mt-8">
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
