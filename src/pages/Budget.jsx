// src/pages/Budget.jsx
import { useEffect, useState } from 'react';

function Budget() {
  const savedName = localStorage.getItem('cq-name') || '';
  const [name, setName] = useState(savedName);
  const [groupSize, setGroupSize] = useState(12);
  const [houseTotal, setHouseTotal] = useState('');
  const [months, setMonths] = useState(6);
  const [payMethod, setPayMethod] = useState('klarna'); // or 'full'
  const [rentalTotal, setRentalTotal] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [housePayments, setHousePayments] = useState([]);
  const [rentalPayments, setRentalPayments] = useState([]);

  const isAlexis = name.trim().toLowerCase() === 'alexis';

  useEffect(() => {
    const interval = setInterval(() => {
      const storedName = localStorage.getItem('cq-name') || '';
      if (storedName !== name) setName(storedName);
    }, 1000);
    return () => clearInterval(interval);
  }, [name]);

  useEffect(() => {
    const savedHouse = JSON.parse(localStorage.getItem('cq-house-payments') || '[]');
    const savedRental = JSON.parse(localStorage.getItem('cq-rental-payments') || '[]');
    const init = (arr) =>
      Array.from({ length: groupSize }, (_, i) => ({
        name: arr[i]?.name || `Guest ${i + 1}`,
        paid: arr[i]?.paid || false,
      }));
    setHousePayments(init(savedHouse));
    setRentalPayments(init(savedRental));
  }, [groupSize]);

  useEffect(() => {
    localStorage.setItem('cq-house-payments', JSON.stringify(housePayments));
  }, [housePayments]);

  useEffect(() => {
    localStorage.setItem('cq-rental-payments', JSON.stringify(rentalPayments));
  }, [rentalPayments]);

  const handleGroupSizeChange = (value) => {
    const newSize = parseInt(value) || 1;
    setGroupSize(newSize);
    const update = (arr) =>
      Array.from({ length: newSize }, (_, i) => ({
        name: arr[i]?.name || `Guest ${i + 1}`,
        paid: arr[i]?.paid || false,
      }));
    setHousePayments(update(housePayments));
    setRentalPayments(update(rentalPayments));
  };

  const handleNameChange = (index, value, type) => {
    const updated = [...(type === 'house' ? housePayments : rentalPayments)];
    updated[index].name = value;
    type === 'house' ? setHousePayments(updated) : setRentalPayments(updated);
  };

  const togglePaid = (index, type) => {
    const updated = [...(type === 'house' ? housePayments : rentalPayments)];
    updated[index].paid = !updated[index].paid;
    type === 'house' ? setHousePayments(updated) : setRentalPayments(updated);
  };

  const clearPaid = (type) => {
    const cleared = (type === 'house' ? housePayments : rentalPayments).map((p) => ({
      ...p,
      paid: false,
    }));
    type === 'house' ? setHousePayments(cleared) : setRentalPayments(cleared);
  };

  const totalHouse = parseFloat(houseTotal) || 0;
  const rentalPerPerson = (parseFloat(rentalTotal) || 0) / groupSize;
  const extraPerPerson = (parseFloat(extraCost) || 0) / groupSize;

  const interestRate = 0.07;
  const totalWithInterest = totalHouse * (1 + interestRate);
  const housePerPerson = payMethod === 'full'
    ? totalHouse / groupSize
    : totalWithInterest / groupSize;

  const monthlyHousePerPerson = payMethod === 'klarna'
    ? housePerPerson / (parseInt(months) || 1)
    : 0;

  const monthlyBreakdown = payMethod === 'klarna'
    ? Array.from({ length: parseInt(months) || 0 }, (_, i) => ({
        month: `Month ${i + 1}`,
        perPerson: monthlyHousePerPerson.toFixed(2),
      }))
    : [];

  const totalPerPerson = payMethod === 'full'
    ? housePerPerson + rentalPerPerson + extraPerPerson
    : monthlyHousePerPerson + rentalPerPerson + extraPerPerson;

  const handleDownloadCSV = () => {
    let csv = 'Name,House Paid?,Car Paid?,Total Owes\n';
    for (let i = 0; i < groupSize; i++) {
      const pname = housePayments[i]?.name || `Guest ${i + 1}`;
      const housePaid = housePayments[i]?.paid ? 'Yes' : 'No';
      const carPaid = rentalPayments[i]?.paid ? 'Yes' : 'No';
      csv += `${pname},${housePaid},${carPaid},${totalPerPerson.toFixed(2)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cq_budget_summary.csv';
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-purple-700 mb-2">
        👋 Welcome, {isAlexis ? 'Supreme Master Alexis 👑' : name || 'Friend'}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <label className="font-medium text-sm">Group Size</label>
        <input
          type="number"
          value={groupSize}
          onChange={(e) => handleGroupSizeChange(e.target.value)}
          className="w-24 border rounded p-2"
        />
        <label className="font-medium text-sm ml-4">Payment Method</label>
        <select
          value={payMethod}
          onChange={(e) => setPayMethod(e.target.value)}
          className="border rounded p-2"
        >
          <option value="klarna">Klarna / Affirm</option>
          <option value="full">Pay in Full</option>
        </select>
        {payMethod === 'klarna' && (
          <input
            type="number"
            min="1"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="w-20 border rounded p-2"
            placeholder="Months"
          />
        )}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-sm mb-1">🏠 Total House Cost</label>
          <input
            type="number"
            value={houseTotal}
            onChange={(e) => setHouseTotal(e.target.value)}
            className="w-full border rounded p-2"
          />
          <p className="text-xs mt-1 text-gray-600">
            {payMethod === 'klarna'
              ? `Est. per person: $${monthlyHousePerPerson.toFixed(2)} / mo x ${months} months`
              : `Per person: $${housePerPerson.toFixed(2)} (full)`}
          </p>
        </div>

        <div>
          <label className="block font-medium text-sm mb-1">🚗 Rental Cost</label>
          <input
            type="number"
            value={rentalTotal}
            onChange={(e) => setRentalTotal(e.target.value)}
            className="w-full border rounded p-2"
          />
          <p className="text-xs mt-1 text-gray-600">Per person: ${rentalPerPerson.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block font-medium text-sm mb-1">🧺 Extra Cost</label>
        <input
          type="number"
          value={extraCost}
          onChange={(e) => setExtraCost(e.target.value)}
          className="w-full border rounded p-2"
        />
        <p className="text-xs mt-1 text-gray-600">Per person: ${extraPerPerson.toFixed(2)}</p>
      </div>

      {payMethod === 'klarna' && (
        <div className="mt-6">
          <h2 className="font-semibold text-sm mb-2">📆 Klarna Breakdown</h2>
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Month</th>
                <th className="border px-2 py-1 text-right">Per Person</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.month}</td>
                  <td className="border px-2 py-1 text-right">${row.perPerson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-right">
        <button
          onClick={handleDownloadCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download CSV
        </button>
      </div>

      <div className="bg-yellow-50 text-sm text-gray-700 border border-yellow-300 p-4 rounded mt-6">
        <h2 className="font-semibold mb-2">🧾 Notes</h2>
        <p className="mb-2">Send payments to <strong>$alexparker03</strong></p>
        <p>
          Klarna/Affirm totals are approximate and include estimated interest. Actual terms may vary.
        </p>
        <p>🚗 Rental payments due day of pickup.</p>
      </div>
    </div>
  );
}

export default Budget;
