import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase/config';
import { useUser } from '../context/UserContext';

function Stiizy() {
  const [item, setItem] = useState('');
  const [requests, setRequests] = useState([]);
  const [locked, setLocked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const { name: appUsername } = useUser();

  const PASSWORD = 'cq2025';
  const userKey = appUsername?.trim().toLowerCase() || '';

  useEffect(() => {
    if (!userKey) return;

    const reqRef = ref(database, `lists/stiizy/${userKey}`);
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val() || [];
      setRequests(data);
    });

    const lockedStatus = localStorage.getItem('cq-rental-locked') === 'true';
    setLocked(lockedStatus);

    return () => unsubscribe();
  }, [userKey]);

  const updateRequests = (newList) => {
    setRequests(newList);
    if (userKey) {
      set(ref(database, `lists/stiizy/${userKey}`), newList);
    }
  };

  const handleAdd = () => {
    if (!item.trim()) return;
    const updated = [...requests, item.trim()];
    updateRequests(updated);
    setItem('');
  };

  const handleDelete = (index) => {
    const updated = requests.filter((_, i) => i !== index);
    updateRequests(updated);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password.');
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-center mb-4">🔒 Protected Page</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">🍬 STIIZY Requests (18+)</h2>

      {/* STIIZY menu links */}
      <div className="mb-4 space-y-1 text-center text-sm text-blue-600 underline">
        <a
          href="https://weedmaps.com/dispensaries/stiiizy-pomona/edibles"
          target="_blank"
          rel="noopener noreferrer"
        >
          🌈 Edibles Menu
        </a>
        <a
          href="https://weedmaps.com/dispensaries/stiiizy-pomona/beverages"
          target="_blank"
          rel="noopener noreferrer"
        >
          🧃 Drinks Menu
        </a>
        <a
          href="https://weedmaps.com/dispensaries/stiiizy-pomona/capsules"
          target="_blank"
          rel="noopener noreferrer"
        >
          💊 Capsules Menu
        </a>
      </div>

      {locked && (
        <p className="text-red-500 text-center mb-2">Editing is locked. Requests are final.</p>
      )}

      {!locked && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter the <span className="font-bold">exact product name</span> from the menu:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. 'Stiiizy Gummies Sour Strawberry'"
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <button
              onClick={handleAdd}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tip: Copy directly from the{' '}
            <a
              href="https://weedmaps.com/dispensaries/stiiizy-pomona/edibles"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              STIIZY menu
            </a>{' '}
            to avoid confusion.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {requests.map((req, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
          >
            <span>{req}</span>
            {!locked && (
              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {requests.length === 0 && (
          <li className="text-center text-gray-500">No requests yet.</li>
        )}
      </ul>
    </div>
  );
}

export default Stiizy;
