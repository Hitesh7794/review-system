const { Institute } = require('../models');
const axios = require('axios');

// Calculate distance between two points using Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  // Earth radius in km
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// Geocode address to get coordinates
const geocodeAddress = async (address) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
    );
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error.message);
    return null;
  }
};

// Validate coordinates are within valid ranges
const validateCoordinates = (lat, lon) => {
  if (lat === null || lon === null) return false;
  
  // Latitude: -90 to 90
  // Longitude: -180 to 180
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

// Find institutes within radius (km)
const findNearby = async (lat, lon, radius) => {
  try {
    const institutes = await Institute.findAll({
      where: { 
        status: 'APPROVED',
        latitude: { [require('sequelize').Op.not]: null },
        longitude: { [require('sequelize').Op.not]: null }
      }
    });
  
    return institutes.filter(inst => {
      const distance = haversineDistance(
        lat, lon, 
        parseFloat(inst.latitude), 
        parseFloat(inst.longitude)
      );
      return distance <= radius;
    });
  } catch (error) {
    console.error('Geolocation search failed:', error);
    return [];
  }
};

module.exports = {
  haversineDistance,
  findNearby,
  geocodeAddress,
  validateCoordinates
};