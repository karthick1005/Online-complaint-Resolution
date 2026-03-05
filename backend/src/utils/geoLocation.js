/**
 * Geolocation Utility
 * Handles both IP-based and coordinate-based geolocation
 */

const getClientIp = (req) => {
  // Get IP from various headers (handles proxies)
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    'unknown'
  );
};

/**
 * Get location from IP address
 * Uses a free IP geolocation service
 * Fallback option if client doesn't provide coordinates
 */
const getLocationFromIP = async (ipAddress) => {
  try {
    // Skip geolocation for localhost/development
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === 'unknown') {
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        city: 'Development',
        country: 'Local',
        source: 'default'
      };
    }

    // Using ip-api.com free tier (no API key required)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=lat,lon,city,country`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`IP API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success' && data.lat && data.lon) {
      return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        source: 'ip'
      };
    } else {
      // Use default coordinates if IP lookup failed
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        city: 'Default',
        country: 'Default',
        source: 'default'
      };
    }
  } catch (error) {
    console.warn('⚠️  Geolocation lookup failed, using default coordinates:', error.message);
    // Return default coordinates on any error
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      city: 'Default',
      country: 'Default',
      source: 'default'
    };
  }
};

/**
 * Validate coordinates
 */
const validateCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return false;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Check if coordinates are valid
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
 * Get location with fallback
 * Priority: Client coordinates > IP geolocation > Default coordinates
 */
const getLocationInfo = async (req, clientLatitude, clientLongitude) => {
  // If client provided valid coordinates, use them
  if (validateCoordinates(clientLatitude, clientLongitude)) {
    return {
      latitude: parseFloat(clientLatitude),
      longitude: parseFloat(clientLongitude),
      source: 'client'
    };
  }

  // Fallback to IP-based geolocation
  const clientIp = getClientIp(req);
  const ipLocation = await getLocationFromIP(clientIp);

  if (ipLocation) {
    return {
      latitude: ipLocation.latitude,
      longitude: ipLocation.longitude,
      city: ipLocation.city,
      country: ipLocation.country,
      source: ipLocation.source
    };
  }

  // Default fallback (shouldn't reach here now, but just in case)
  console.warn('⚠️  Using hardcoded default location');
  return {
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'Default City',
    country: 'Default Country',
    source: 'default'
  };
};

module.exports = {
  getClientIp,
  getLocationFromIP,
  validateCoordinates,
  getLocationInfo
};
