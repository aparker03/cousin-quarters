import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function GroceryList() {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [list, setList] = useState([]);
  const [locked, setLocked] = useState(false);
  const [showAlcohol, setShowAlcohol] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [filter, setFilter] = useState('all');
  const { appUsername } = useOutletContext();

  const ALCOHOL_PASSWORD = 'cq2025';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cq-grocery-list')) || [];
    const lockedStatus = localStorage.getItem('cq-rental-locked') === 'true';
    setList(saved);
    setLocked(lockedStatus);
  }, []);

  const updateList = (newList) => {
    setList(newList);
    localStorage.setItem('cq-grocery-list', JSON.stringify(newList));
  };

  const handleAdd = () => {
    if (!item.trim()) return;
    const newItem = {
      name: item.trim(),
      quantity: parseInt(quantity) || 1,
      bought: false,
    };
    const updated = [...list, newItem];
    updateList(updated);
    setItem('');
    setQuantity(1);
  };

  const handleDelete = (index) => {
    const updated = list.filter((_, i) => i !== index);
    updateList(updated);
  };

  const handleExport = () => {
    const csv = list
      .map((item) => `"${item.name}","${item.quantity}","${item.bought ? 'Yes' : 'No'}"`)
      .join('\n');
    const blob = new Blob([`Item,Quantity,Bought\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const temp = document.createElement('a');
    temp.href = url;
    temp.download = 'grocery_list.csv';
    temp.click();
  };

  const handleAlcoholUnlock = () => {
    if (passwordInput === ALCOHOL_PASSWORD) {
      setShowAlcohol(true);
      setPasswordInput('');
    } else {
      alert('Incorrect password.');
    }
  };

  const handleToggleBought = (index) => {
    const updated = [...list];
    updated[index].bought = !updated[index].bought;
    updateList(updated);
  };

  const getCategory = (text) => {
    const lower = text.toLowerCase();
    const alcoholKeywords = [
      'vodka', 'rum', 'whiskey', 'tequila', 'bourbon', 'brandy',
      'ciroc', 'don julio', 'casamigos', 'jack daniels', 'patron',
      'fireball', 'tito', 'hennessy', 'jameson', 'grey goose',
      'bacardi', 'crown royal', '1800', 'svedka', 'e&j'
    ];
    if (alcoholKeywords.some((kw) => lower.includes(kw))) return 'alcohol';
    if (lower.includes('chip') || lower.includes('snack')) return 'snack';
    if (lower.includes('fruit') || lower.includes('banana') || lower.includes('berry')) return 'fruit';
    if (lower.includes('drink') || lower.includes('juice') || lower.includes('water')) return 'drink';
    if (lower.includes('meat') || lower.includes('chicken')) return 'meat';
    if (lower.includes('veg') || lower.includes('salad')) return 'vegetable';
    return 'other';
  };

  const getBadgeStyle = (category) => ({
    alcohol: 'bg-indigo-100 text-indigo-800',
    snack: 'bg-yellow-100 text-yellow-800',
    fruit: 'bg-pink-100 text-pink-800',
    drink: 'bg-blue-100 text-blue-800',
    meat: 'bg-red-100 text-red-800',
    vegetable: 'bg-green-100 text-green-800',
    other: 'bg-gray-200 text-gray-800',
  }[category] || 'bg-gray-200 text-gray-800');

  const getEmoji = (category) => ({
    alcohol: '🥃',
    snack: '🍿',
    fruit: '🍎',
    drink: '🧃',
    meat: '🍗',
    vegetable: '🥦',
    other: '🛒',
  }[category] || '🛒');

  const filteredList = list.filter((item) => {
    const cat = getCategory(item.name);
    if (cat === 'alcohol' && !showAlcohol) return false;
    if (filter === 'all') return true;
    return cat === filter;
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-2 text-center">🛒 Grocery List</h2>
      <p className="text-sm text-center text-gray-600 mb-4">
        Add must-haves or fun extras for the trip. Quantity optional.
      </p>

      {locked && (
        <p className="text-red-500 text-center mb-3">Editing is locked. List is final.</p>
      )}

      {!locked && (
        <div className="mb-4 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Casamigos, Sprite, Chips"
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 border border-gray-300 p-2 rounded"
            />
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 text-sm gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">Show All</option>
          <option value="fruit">Fruit</option>
          <option value="snack">Snack</option>
          <option value="drink">Drink</option>
          <option value="meat">Meat</option>
          <option value="vegetable">Vegetable</option>
          <option value="alcohol">Alcohol</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={handleExport}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        ✅ Use the checkbox to mark an item as bought. Bought items will fade and be crossed out, but still stay visible unless deleted.
      </p>

      {!showAlcohol && list.some((item) => getCategory(item.name) === 'alcohol') && (
        <div className="mb-4">
          <label className="text-sm block mb-1">Enter password to view alcohol items:</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <button
              onClick={handleAlcoholUnlock}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto">
        <ul className="space-y-2">
          {filteredList.map((item, index) => {
            const cat = getCategory(item.name);
            const isBought = item.bought;

            return (
              <li
                key={index}
                className={`flex justify-between items-center px-4 py-2 rounded ${
                  isBought ? 'bg-gray-200 opacity-70 line-through' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="checkbox"
                    checked={isBought}
                    onChange={() => handleToggleBought(index)}
                    className="h-4 w-4"
                  />
                  <span>{getEmoji(cat)}</span>
                  <span className="flex-1 break-words">{item.name}</span>
                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getBadgeStyle(cat)}`}
                  >
                    {cat}
                  </span>
                  {!locked && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {filteredList.length === 0 && (
            <li className="text-center text-gray-500">No items to display.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default GroceryList;
