import React, { useState } from 'react';
import RoutesConfig from './components/Routes';
import PinLock from './components/PinLock';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="App">
      <RoutesConfig />
    </div>
  );
}

export default App;