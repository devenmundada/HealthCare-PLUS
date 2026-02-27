/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '../types/healthcare';
import L from 'leaflet';
import IndianCitySelector from '../components/location/IndianCitySelector';
import IndianHealthAPI, { IndianHospital } from '../services/indian-health-api';
// Import the real IndianHealthAPI service

// Custom hospital icon for Leaflet
const hospitalIcon = L.divIcon({
  html: `
    <div style="
      background-color: #DC2626;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      🏥
    </div>
  `,
  className: 'hospital-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface IndianCity {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

const MapPrediction: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<IndianCity>({
    id: '2',
    name: 'Delhi',
    state: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
  });

  const [hospitals, setHospitals] = useState<IndianHospital[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<IndianHospital | null>(null);

  // Fetch real Indian hospitals when city changes
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the real IndianHealthAPI service
        const realHospitals = await IndianHealthAPI.getHospitalsByCity(selectedCity.name);
        setHospitals(realHospitals);
        
        // If we have hospitals, select the first one
        if (realHospitals.length > 0) {
          setSelectedHospital(realHospitals[0]);
        }
      } catch (err) {
        setError('Failed to fetch hospitals. Please try again.');
        console.error('Error fetching hospitals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [selectedCity]);

  const handleCitySelect = (city: IndianCity) => {
    setSelectedCity(city);
  };

  const handleGetDirections = (hospital: IndianHospital) => {
    if (hospital.latitude && hospital.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
        '_blank'
      );
    }
  };

  const handleCallHospital = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Find Real Indian Hospitals
          </h1>
          <p className="text-gray-600">
            Search for hospitals across India with real contact information
          </p>
        </div>

        {/* City Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your City in India</h2>
          <IndianCitySelector
            onCitySelect={handleCitySelect}
            selectedCity={selectedCity}
          />
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading real Indian hospitals...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map and Hospital List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 h-[500px]">
              <MapContainer
                center={[selectedCity.latitude, selectedCity.longitude]}
                zoom={12}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Mark selected city */}
                <Marker
                  position={[selectedCity.latitude, selectedCity.longitude]}
                  icon={L.divIcon({
                    html: `<div style="
                      background-color: #3B82F6;
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-size: 20px;
                      border: 3px solid white;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    ">📍</div>`,
                    className: 'city-marker',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                  })}
                >
                  <Popup>
                    <div className="font-semibold">{selectedCity.name}, {selectedCity.state}</div>
                    <div className="text-sm text-gray-600">Selected City</div>
                  </Popup>
                </Marker>
                
                {/* Real hospital markers */}
                {hospitals.map((hospital) => (
                  <Marker
                    key={hospital.id}
                    position={[hospital.lat, hospital.lng]}
                    icon={hospitalIcon}
                    eventHandlers={{
                      click: () => setSelectedHospital(hospital),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg text-gray-900">{hospital.name}</h3>
                        <p className="text-sm text-gray-600">{hospital.city}, {hospital.state}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-2">Type:</span>
                            <span className="text-gray-700">{hospital.type}</span>
                          </div>
                          {hospital.phone && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium mr-2">Phone:</span>
                              <a 
                                href={`tel:${hospital.phone}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {hospital.phone}
                              </a>
                            </div>
                          )}
                          {hospital.ayushmanBharat && (
                            <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              ✓ Ayushman Bharat
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Hospital Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-[500px] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Hospitals in {selectedCity.name}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({hospitals.length} found)
                </span>
              </h2>

              {hospitals.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hospitals found
                  </h3>
                  <p className="text-gray-600">
                    Try selecting a different city in India
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedHospital?.id === hospital.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              {hospital.type}
                            </span>
                            {hospital.ayushmanBharat && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Ayushman Bharat
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Beds: {hospital.availableBeds || 'N/A'} available
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {hospital.phone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCallHospital(hospital.phone);
                              }}
                              className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center"
                            >
                              📞 Call
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetDirections(hospital);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                          >
                            🗺️ Directions
                          </button>
                        </div>
                      </div>
                      
                      {hospital.phone && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm">
                            <span className="font-medium">Contact:</span>{' '}
                            <a 
                              href={`tel:${hospital.phone}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {hospital.phone}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            About Real Indian Hospital Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <span className="text-blue-600">🏥</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Real Hospitals</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Showing actual hospitals from the Indian healthcare database
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <span className="text-green-600">📍</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Accurate Locations</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Real addresses and coordinates for Indian hospitals
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <span className="text-purple-600">📞</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verified Contacts</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Real phone numbers you can actually call
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPrediction;