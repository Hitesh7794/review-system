const { Institute } = require('../models');
const { geocodeAddress, validateCoordinates } = require('../services/geolocation.service');

(async () => {
  try {
    const institutes = await Institute.findAll({
      where: {
        latitude: null,
        longitude: null
      }
    });
    console.log(`Found ${institutes.length} institutes with NULL coordinates.`);
    for (const inst of institutes) {
      const address = `${inst.address_street}, ${inst.address_city}, ${inst.address_state}, ${inst.address_country}`;
      try {
        const coordinates = await geocodeAddress(address);
        if (coordinates && validateCoordinates(coordinates.latitude, coordinates.longitude)) {
          await inst.update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          });
          console.log(`Updated institute ${inst.id} (${inst.name}) with coordinates:`, coordinates);
        } else {
          console.warn(`Geocoding failed for institute ${inst.id} (${inst.name}) at address: ${address}`);
        }
      } catch (error) {
        console.error(`Error geocoding institute ${inst.id} (${inst.name}):`, error.message);
      }
    }
    console.log('Backfill complete.');
    process.exit(0);
  } catch (err) {
    console.error('Backfill script failed:', err);
    process.exit(1);
  }
})(); 