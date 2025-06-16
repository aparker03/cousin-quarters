import { useEffect, useState } from 'react';

function NameLogin({ onNameChange }) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cq-name');
    if (saved) {
      setName(saved);
      if (onNameChange) onNameChange(saved);
    } else {
      setEditing(true);
    }
  }, []);

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem('cq-name', trimmed);
      setName(trimmed);
      setEditing(false);
      if (onNameChange) onNameChange(trimmed); // notify parent immediately
    }
  };

  const clearName = () => {
    localStorage.removeItem('cq-name');
    setName('');
    setEditing(true);
    if (onNameChange) onNameChange(''); // force refresh logic
  };

  return (
    <div className="bg-purple-50 border border-purple-200 p-3 mb-4 rounded-md text-sm text-gray-700 shadow-sm flex items-center justify-between flex-wrap">
      {editing ? (
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={saveName}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto justify-between">
          <span>
            👋 Welcome, <strong>{name}</strong>
            {name.toLowerCase() === 'alexis' && (
              <span className="ml-1 text-green-700">(The Don)</span>
            )}
          </span>
          <button
            onClick={clearName}
            className="text-sm text-blue-600 underline hover:text-blue-800 mt-1 sm:mt-0"
          >
            Change name
          </button>
        </div>
      )}
    </div>
  );
}

export default NameLogin;
