import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

function NameLogin() {
  const { name, setName } = useUser();
  const [inputValue, setInputValue] = useState(name || '');
  const [editing, setEditing] = useState(!name);

  useEffect(() => {
    // Sync input with global context name
    setInputValue(name);
    if (!name) setEditing(true);
  }, [name]);

  const saveName = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setName(trimmed); // Updates context and localStorage
      setEditing(false);
    }
  };

  const clearName = () => {
    setName('');
    setEditing(true);
  };

  return (
    <div className="bg-purple-50 border border-purple-200 p-3 mb-4 rounded-md text-sm text-gray-700 shadow-sm flex items-center justify-between flex-wrap">
      {editing ? (
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Enter your name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
