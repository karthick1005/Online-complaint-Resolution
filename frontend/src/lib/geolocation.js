/**
 * Frontend Geolocation Utility
 * Provides helper functions for location detection in the browser
 */

/**
 * Request user's current location using browser Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage =
              'Location request timed out. Please try again or enter location manually.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached location
      }
    );
  });
};

/**
 * Get address from coordinates using reverse geocoding
 * (Note: Requires backend API support or external service)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'OnlineComplaintSystem'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    return data.address?.road || data.address?.city || 'Location found';
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

/**
 * Format coordinates for display
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string}
 */
export const formatCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return '';
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Validate coordinates
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @returns {boolean}
 */
export const validateCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return false;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Watch user's location and return watcher ID
 * Call stopWatchingLocation with the returned ID to stop watching
 * @param {function} onLocationChange - Callback when location changes
 * @param {function} onError - Callback on error
 * @returns {number} - Watcher ID
 */
export const watchLocation = (onLocationChange, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      onLocationChange({
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6))
      });
    },
    (error) => {
      onError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

/**
 * Stop watching user's location
 * @param {number} watcherId - ID returned from watchLocation
 */
export const stopWatchingLocation = (watcherId) => {
  if (watcherId !== null) {
    navigator.geolocation.clearWatch(watcherId);
  }
};
