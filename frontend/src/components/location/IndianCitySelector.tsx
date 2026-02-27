import React, { useState } from 'react';

interface IndianCity {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

const INDIAN_CITIES: IndianCity[] = [
  { id: '1', name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { id: '2', name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { id: '3', name: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { id: '4', name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { id: '5', name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { id: '6', name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { id: '7', name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { id: '8', name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { id: '9', name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { id: '10', name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
];

interface IndianCitySelectorProps {
  onCitySelect: (city: IndianCity) => void;
  selectedCity?: IndianCity;
}

const IndianCitySelector: React.FC<IndianCitySelectorProps> = ({ onCitySelect, selectedCity }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = INDIAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Indian City
        </label>
        <input
          type="text"
          placeholder="Search city or state..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredCities.map((city) => (
          <div
            key={city.id}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedCity?.id === city.id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onCitySelect(city)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">{city.name}</h3>
                <p className="text-sm text-gray-600">{city.state}</p>
              </div>
              <div className="text-sm text-gray-500">
                {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCity && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-800">
            Selected: <span className="font-bold">{selectedCity.name}, {selectedCity.state}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default IndianCitySelector;