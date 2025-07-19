import { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { normalizeUserKey } from '../hooks/useHouseVotes';

function NameLogin() {
  const { name, setName, originalName, setOriginalName } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [editing, setEditing] = useState(!name);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(originalName || name || '');
    if (!name) setEditing(true);
  }, [name, originalName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const saveName = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      const normalized = normalizeUserKey(trimmed);
      setName(normalized);          // for logic
      setOriginalName(trimmed);     // for display
      setEditing(false);
    }
  };

  const clearName = () => {
    setName('');
    setOriginalName('');
    setEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveName();
  };

  return (
    <div className="bg-purple-50 border border-purple-200 p-3 mb-4 rounded-md text-sm text-gray-700 shadow-sm flex items-center justify-between flex-wrap">
      {editing ? (
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
            👋 Welcome, <strong>{originalName || name}</strong>
            {name === 'alexis' && (
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
