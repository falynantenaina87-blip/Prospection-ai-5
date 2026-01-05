import React, { useState } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [activity, setActivity] = useState('Restaurant');
  const [city, setCity] = useState('Paris');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity.trim() && city.trim()) {
      onSearch({ activity, city });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Activity / Niche
            </div>
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Real Estate, Bakery"
            required
          />
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
             <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Target City
            </div>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Lyon, New York"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`h-11 px-6 rounded-lg font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Start Audit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
