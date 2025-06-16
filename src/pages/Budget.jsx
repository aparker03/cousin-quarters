import { useState } from 'react';

function Budget() {
  const [groupSize, setGroupSize] = useState(11);

  const [houseTotal, setHouseTotal] = useState('');
  const [months, setMonths] = useState('');
  const [payMethod, setPayMethod] = useState('klarna');

  const [rentalTotal, setRentalTotal] = useState('');
  const [extraCost, setExtraCost] = useState('');

  const [housePayments, setHousePayments] = useState(Array.from({ length: groupSize }, (_, i) => ({ name: `Guest ${i + 1}`, paid: false })));
  const [rentalPayments, setRentalPayments] = useState(Array.from({ length: groupSize }, (_, i) => ({ name: `Guest ${i + 1}`, paid: false })));

  const handleGroupSizeChange = (value) => {
    const newSize = parseInt(value) || 1;
    setGroupSize(newSize);

    const update = (arr) => Array.from({ length: newSize }, (_, i) => ({
      name: arr[i]?.name || `Guest ${i + 1}`,
      paid: arr[i]?.paid || false,
    }));

    setHousePayments(update(housePayments));
    setRentalPayments(update(rentalPayments));
  };

  const handleNameChange = (index, value, type) => {
    const updated = type === 'house' ? [...housePayments] : [...rentalPayments];
    updated[index].name = value;
    type === 'house' ? setHousePayments(updated) : setRentalPayments(updated);
  };

  const togglePaid = (index, type) => {
    const updated = type === 'house' ? [...housePayments] : [...rentalPayments];
    updated[index].paid = !updated[index].paid;
    type === 'house' ? setHousePayments(updated) : setRentalPayments(updated);
  };

  const clearPaid = (type) => {
    const cleared = (type === 'house' ? housePayments : rentalPayments).map((p) => ({ ...p, paid: false }));
    type === 'house' ? setHousePayments(cleared) : setRentalPayments(cleared);
  };

  const housePerPerson = (parseFloat(houseTotal) || 0) / groupSize;
  const rentalPerPerson = (parseFloat(rentalTotal) || 0) / groupSize;
  const extraPerPerson = (parseFloat(extraCost) || 0) / groupSize;
  const totalPerPerson = housePerPerson + rentalPerPerson + extraPerPerson;

  const monthlyHousePayment = (parseFloat(houseTotal) || 0) / (parseInt(months) || 1);
  const monthlyHousePerPerson = monthlyHousePayment / groupSize;

  const monthlyBreakdown = Array.from({ length: parseInt(months) || 0 }, (_, i) => ({
    month: `Payment ${i + 1}`,
    total: monthlyHousePayment.toFixed(2),
    perPerson: monthlyHousePerPerson.toFixed(2),
  }));

  const handleDownloadCSV = () => {
    let csv = `Name,House Paid?,Car Paid?,Total Owes\n`;
    for (let i = 0; i < groupSize; i++) {
      const name = housePayments[i]?.name || `Guest ${i + 1}`;
      const housePaid = housePayments[i]?.paid ? 'Yes' : 'No';
      const carPaid = rentalPayments[i]?.paid ? 'Yes' : 'No';
      const owes = totalPerPerson.toFixed(2);
      csv += `${name},${housePaid},${carPaid},${owes}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cq_cost_summary.csv';
    a.click();
  };

  return (
      <div className="max-w-6xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-md print:p-0 print:shadow-none print:bg-transparent">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold text-purple-700">💰 Cost Split</h1>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            🖨️ Print View
          </button>
        </div>

        <p className="mt-2 text-gray-600">
          Track who owes what — including rentals, house, and extras.
        </p>

        <div className="mt-6 space-y-6">
          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
            <input
              type="number"
              min="1"
              value={groupSize}
              onChange={(e) => handleGroupSizeChange(e.target.value)}
              className="w-24 border border-gray-300 rounded p-2"
            />
          </div>

          {/* House Payments */}
          <div>
            <h2 className="text-lg font-semibold mb-2">🏠 House Payment via Klarna or Affirm</h2>

            <label className="block text-sm font-medium text-gray-700">Payment Provider</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            >
              <option value="klarna">Klarna</option>
              <option value="affirm">Affirm</option>
            </select>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total House Cost</label>
                <input
                  type="number"
                  value={houseTotal}
                  onChange={(e) => setHouseTotal(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Months</label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
            </div>

            {monthlyBreakdown.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">📆 Monthly Breakdown</h3>
                <table className="min-w-full text-sm border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">Month</th>
                      <th className="border px-2 py-1 text-right">Total</th>
                      <th className="border px-2 py-1 text-right">Per Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((row, i) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{row.month}</td>
                        <td className="border px-2 py-1 text-right">${row.total}</td>
                        <td className="border px-2 py-1 text-right">${row.perPerson}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rentals and Extras */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold">🚗 Rentals (Pay Day-Of)</h2>
              <input
                type="number"
                value={rentalTotal}
                onChange={(e) => setRentalTotal(e.target.value)}
                className="w-full border mt-1 border-gray-300 rounded p-2"
              />
              <p className="text-sm text-gray-600 mt-1">Per person: ${rentalPerPerson.toFixed(2)}</p>
            </div>

            <div>
              <h2 className="font-semibold">🧺 Extras</h2>
              <input
                type="number"
                value={extraCost}
                onChange={(e) => setExtraCost(e.target.value)}
                className="w-full border mt-1 border-gray-300 rounded p-2"
              />
              <p className="text-sm text-gray-600 mt-1">Per person: ${extraPerPerson.toFixed(2)}</p>
            </div>
          </div>

          {/* House Tracker */}
          <div>
            <h2 className="text-lg font-semibold mb-2">🏠 House Payment Tracker</h2>
            <button
              onClick={() => clearPaid('house')}
              className="mb-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Clear All Paid (House)
            </button>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Name</th>
                    <th className="border px-2 py-1 text-center">Paid?</th>
                    <th className="border px-2 py-1 text-right">Owes</th>
                  </tr>
                </thead>
                <tbody>
                  {housePayments.map((person, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handleNameChange(i, e.target.value, 'house')}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={person.paid}
                          onChange={() => togglePaid(i, 'house')}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {person.paid ? '$0.00' : `$${housePerPerson.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rental Tracker */}
          <div>
            <h2 className="text-lg font-semibold mt-6 mb-2">🚗 Car Rental Payment Tracker</h2>
            <button
              onClick={() => clearPaid('rental')}
              className="mb-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Clear All Paid (Car)
            </button>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Name</th>
                    <th className="border px-2 py-1 text-center">Paid?</th>
                    <th className="border px-2 py-1 text-right">Owes</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalPayments.map((person, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handleNameChange(i, e.target.value, 'rental')}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={person.paid}
                          onChange={() => togglePaid(i, 'rental')}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {person.paid ? '$0.00' : `$${rentalPerPerson.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download + Notes */}
          <div className="text-right mt-4">
            <button
              onClick={handleDownloadCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-yellow-50 text-sm text-gray-700 border border-yellow-300 p-4 rounded mt-6">
            <h2 className="font-semibold mb-2">🧾 Payment Notes</h2>
            <p className="mb-2">
              I’ll use Klarna or Affirm to pay for the house, then split the cost monthly. Everyone can choose to pay monthly, in full, or somewhere in between.
            </p>
            <p className="mb-2">
              Payments will be sent to a separate CashApp/Zelle account just for this trip — so it’s clean and clear.
            </p>
            <p>
              🚗 Car rentals will be paid on pickup day. Everyone sends their share that day.
            </p>
          </div>
        </div>
      </div>
  );
}

export default Budget;
