import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

const IngredientsChecklist = ({ ingredients }) => {
  // Create state to track which ingredients are checked off.
  // We initialize it as an object like { 0: false, 1: false, ... }
  const [checkedState, setCheckedState] = useState(
    new Array(ingredients.length).fill(false)
  );

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Ingredients</h3>
        <ul className="space-y-3">
            {ingredients.map(({ name, quantity }, index) => (
                <li key={index}>
                    <label className="flex items-center cursor-pointer group">
                         <input
                            type="checkbox"
                            id={`ingredient-checkbox-${index}`}
                            name={name}
                            value={name}
                            checked={checkedState[index]}
                            onChange={() => handleOnChange(index)}
                            className="sr-only" // Hide the default checkbox
                        />
                        {checkedState[index] ? (
                            <CheckSquare className="w-5 h-5 text-green-500 mr-3" />
                        ) : (
                            <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mr-3" />
                        )}
                        <span className={`flex-1 ${checkedState[index] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            <span className="font-semibold">{quantity}</span> {name}
                        </span>
                    </label>
                </li>
            ))}
        </ul>
    </div>
  );
};

export default IngredientsChecklist; 