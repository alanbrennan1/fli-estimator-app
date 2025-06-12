import { useState } from 'react';

export default function PasswordGate({ onAccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
console.log('ENV PASSWORD:', process.env.NEXT_PUBLIC_APP_PASSWORD);


    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      localStorage.setItem('fli_estimator_access', 'true');
      onAccess();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Access Restricted</h2>
        <p className="text-sm mb-4 text-gray-600">Please enter the access password:</p>
        <input
          type="password"
          className="border p-2 w-full mb-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full text-sm"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
