function App({ appUsername }) {
  return (
    <>
      <h1 className="section-title">🎉 Welcome to Cousin Quarters</h1>
      <p className="mt-2 text-gray-600">
        Use the sidebar to get started planning the trip{appUsername ? `, ${appUsername}!` : "!"}
      </p>
    </>
  );
}

export default App;
