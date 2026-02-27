import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../layout/GlassCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { 
  Thermometer, 
  Wind, 
  Cloud, 
  AlertTriangle, 
  Droplets,
  Sun,
  CloudRain,
  CloudSnow,
  MapPin,
  RefreshCw,
  Shield,
  Activity,
  Heart
} from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  aqi: number;
  feelsLike: number;
  advisory: string;
  icon: React.ReactNode;
  color: string;
  healthRisks: string[];
}

export const WeatherNotifications: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Mock cities for demo
  const mockCities = [
    { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
    { name: 'New York, NY', lat: 40.7128, lon: -74.0060 },
    { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
    { name: 'Miami, FL', lat: 25.7617, lon: -80.1918 },
    { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 }
  ];

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="w-6 h-6 text-neutral-400" />;
    } else if (lowerCondition.includes('rain')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />;
    } else if (lowerCondition.includes('snow')) {
      return <CloudSnow className="w-6 h-6 text-blue-300" />;
    }
    return <Thermometer className="w-6 h-6 text-orange-500" />;
  };

  // Get AQI color and label
  const getAQIInfo = (aqi: number) => {
    if (aqi <= 50) return { color: 'bg-clinical-normal text-white', label: 'Good', risk: 'Low' };
    if (aqi <= 100) return { color: 'bg-clinical-low text-white', label: 'Moderate', risk: 'Low' };
    if (aqi <= 150) return { color: 'bg-clinical-moderate text-white', label: 'Unhealthy for Sensitive', risk: 'Medium' };
    if (aqi <= 200) return { color: 'bg-clinical-high text-white', label: 'Unhealthy', risk: 'High' };
    return { color: 'bg-clinical-critical text-white', label: 'Very Unhealthy', risk: 'Critical' };
  };

  // Get health advisory based on weather conditions
  const getHealthAdvisory = (temp: number, aqi: number, humidity: number, condition: string): string => {
    const advisories = [];

    if (temp > 85) {
      advisories.push('High temperature - Stay hydrated and avoid prolonged sun exposure');
    } else if (temp < 40) {
      advisories.push('Low temperature - Dress warmly and watch for hypothermia symptoms');
    }

    if (aqi > 100) {
      advisories.push('Poor air quality - Limit outdoor activities, especially if you have respiratory conditions');
    }

    if (humidity > 70) {
      advisories.push('High humidity - May affect respiratory comfort, stay in well-ventilated areas');
    }

    if (humidity < 30) {
      advisories.push('Low humidity - May cause dry skin and respiratory irritation');
    }

    if (condition.toLowerCase().includes('rain')) {
      advisories.push('Rainy conditions - Be cautious of slippery surfaces and reduced visibility');
    }

    if (advisories.length === 0) {
      return 'Conditions are favorable for outdoor activities. Continue with your normal routine.';
    }

    return advisories.join('. ') + '.';
  };

  // Get health risks based on conditions
  const getHealthRisks = (temp: number, aqi: number, humidity: number): string[] => {
    const risks = [];

    if (aqi > 150) {
      risks.push('Respiratory distress');
      risks.push('Increased asthma risk');
    }

    if (temp > 90) {
      risks.push('Heat exhaustion');
      risks.push('Dehydration');
    }

    if (temp < 32) {
      risks.push('Frostbite risk');
      risks.push('Hypothermia');
    }

    if (humidity > 80) {
      risks.push('Mold sensitivity');
      risks.push('Respiratory discomfort');
    }

    if (aqi > 100 && temp > 80) {
      risks.push('Compounded respiratory stress');
    }

    return risks.length > 0 ? risks : ['Minimal health risks'];
  };

  // Get color based on conditions
  const getConditionColor = (temp: number, aqi: number): string => {
    if (aqi > 150 || temp > 95 || temp < 20) return 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20';
    if (aqi > 100 || temp > 85 || temp < 32) return 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20';
    return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
  };

  // Simulate fetching weather data
  const fetchWeatherData = (lat: number, lon: number, cityName: string) => {
    setLoading(true);
    
    // Mock weather data based on location
    const mockTemperature = 35 + Math.sin(lat) * 25 + Math.cos(lon) * 15; // Varies by location
    const mockHumidity = 40 + Math.sin(lat * 2) * 30;
    const mockWindSpeed = 5 + Math.sin(lon) * 15;
    const mockAQI = 30 + Math.abs(Math.sin(lat) * 150);
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    const mockCondition = conditions[Math.floor(Math.abs(Math.sin(lat + lon)) * conditions.length)];
    
    const weatherIcon = getWeatherIcon(mockCondition);
    const advisory = getHealthAdvisory(mockTemperature, mockAQI, mockHumidity, mockCondition);
    const healthRisks = getHealthRisks(mockTemperature, mockAQI, mockHumidity);
    const color = getConditionColor(mockTemperature, mockAQI);

    setTimeout(() => {
      setWeatherData({
        city: cityName,
        temperature: Math.round(mockTemperature),
        condition: mockCondition,
        humidity: Math.round(mockHumidity),
        windSpeed: Math.round(mockWindSpeed),
        aqi: Math.round(mockAQI),
        feelsLike: Math.round(mockTemperature + (mockHumidity > 70 ? 5 : 0)),
        advisory,
        icon: weatherIcon,
        color,
        healthRisks
      });
      setLoading(false);
    }, 800);
  };

  // Get user location or use mock
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
            // For demo, use nearest mock city
            const nearestCity = mockCities.reduce((prev, curr) => {
              const prevDist = Math.abs(prev.lat - latitude) + Math.abs(prev.lon - longitude);
              const currDist = Math.abs(curr.lat - latitude) + Math.abs(curr.lon - longitude);
              return currDist < prevDist ? curr : prev;
            });
            fetchWeatherData(latitude, longitude, nearestCity.name);
          },
          (error) => {
            console.warn('Using mock location due to:', error.message);
            setLocationError('Using demo location. Enable location for personalized data.');
            // Use first mock city as default
            const defaultCity = mockCities[0];
            setUserLocation({ lat: defaultCity.lat, lon: defaultCity.lon });
            fetchWeatherData(defaultCity.lat, defaultCity.lon, defaultCity.name);
          }
        );
      } else {
        setLocationError('Geolocation not supported. Using demo location.');
        const defaultCity = mockCities[0];
        setUserLocation({ lat: defaultCity.lat, lon: defaultCity.lon });
        fetchWeatherData(defaultCity.lat, defaultCity.lon, defaultCity.name);
      }
    };

    getUserLocation();
  }, []);

  // Handle city selection
  const handleCitySelect = (city: typeof mockCities[0]) => {
    setUserLocation({ lat: city.lat, lon: city.lon });
    fetchWeatherData(city.lat, city.lon, city.name);
  };

  // Refresh weather data
  const handleRefresh = () => {
    if (userLocation) {
      const city = mockCities.find(c => 
        Math.abs(c.lat - userLocation.lat) < 1 && Math.abs(c.lon - userLocation.lon) < 1
      ) || mockCities[0];
      fetchWeatherData(userLocation.lat, userLocation.lon, city.name);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Loading weather data and health insights...
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!weatherData) return null;

  const aqiInfo = getAQIInfo(weatherData.aqi);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Weather & Health Advisory
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Real-time conditions with personalized health guidance
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={handleRefresh}
          className="text-primary-600 dark:text-primary-400"
        >
          Refresh
        </Button>
      </div>

      {locationError && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{locationError}</p>
        </div>
      )}

      {/* Main Weather Card */}
      <GlassCard className={`p-6 bg-gradient-to-r ${weatherData.color} border-0 mb-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Conditions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                  {weatherData.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {weatherData.city}
                    </h3>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Updated just now
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-neutral-900 dark:text-white">
                  {weatherData.temperature}°
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Feels like {weatherData.feelsLike}°
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Wind</span>
                </div>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {weatherData.windSpeed} mph
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Humidity</span>
                </div>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {weatherData.humidity}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Condition</span>
                </div>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {weatherData.condition}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" style={{ color: `var(--${aqiInfo.color.split('-')[1]})` }} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Air Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={aqiInfo.color}>
                    {weatherData.aqi} AQI
                  </Badge>
                  <span className="text-sm font-medium">{aqiInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Health Advisory */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-neutral-800/70">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-neutral-900 dark:text-white">Health Advisory</h4>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300">
                {weatherData.advisory}
              </p>
            </div>
          </div>

          {/* Health Risks & Quick Actions */}
          <div className="space-y-6">
            {/* Health Risks */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-neutral-800/70">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-neutral-900 dark:text-white">Potential Health Risks</h4>
              </div>
              <ul className="space-y-2">
                {weatherData.healthRisks.map((risk, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      risk.includes('Critical') || risk.includes('High') ? 'bg-red-500' :
                      risk.includes('Medium') ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-neutral-700 dark:text-neutral-300">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h4 className="font-bold text-neutral-900 dark:text-white">Recommended Actions</h4>
              </div>
              <div className="space-y-3">
                {weatherData.aqi > 100 && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    • Limit outdoor activities
                  </p>
                )}
                {weatherData.temperature > 85 && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    • Stay hydrated
                  </p>
                )}
                {weatherData.humidity > 70 && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    • Use dehumidifier if needed
                  </p>
                )}
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  • Check in with at-risk family members
                </p>
              </div>
            </div>

            {/* City Selector */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-neutral-800/70">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Check Other Cities</h4>
              <div className="grid grid-cols-2 gap-2">
                {mockCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      weatherData.city === city.name
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {city.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Weather Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-green-600" />
            <h5 className="font-medium text-neutral-900 dark:text-white">Sun Safety</h5>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            UV index may be high. Use SPF 30+ sunscreen if outdoors.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <h5 className="font-medium text-neutral-900 dark:text-white">Hydration</h5>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Drink at least 8 glasses of water daily in current conditions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h5 className="font-medium text-neutral-900 dark:text-white">Activity Level</h5>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {weatherData.aqi < 100 ? 'Good for outdoor exercise' : 'Consider indoor activities'}
          </p>
        </div>
      </div>
    </div>
  );
};