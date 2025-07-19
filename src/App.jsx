import { useUser } from './context/UserContext';

function App() {
  const { name: normalizedName, originalName } = useUser();;
  const displayName = name.trim();
  const isAlexis = displayName.toLowerCase() === 'alexis';

  return (
    <>
      <h1 className="section-title">🎉 Welcome to Cousin Quarters</h1>
      <p className="mt-2 text-gray-600">
        Use the sidebar to get started planning the trip
        {displayName ? (
          <>
            , <strong className="text-purple-700">{displayName}</strong>
            {isAlexis && <span className="ml-1 text-green-700">(The Don)</span>}!
          </>
        ) : (
          '!'
        )}
      </p>
    </>
  );
}

export default App;
