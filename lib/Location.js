// Calculates distance between two latitude/longitude coordinates in km,
// based on the haversine formula.
exports.distance = function(prevLat, prevLong, currLat, currLong) {
    // KNOWN CONSTANTS
    var degreesToRadians = Math.PI / 180;
    var earthRadius = 6371; // approximation in kilometers assuming earth to be spherical
    // CONVERT LATITUDE AND LONGITUDE VALUES TO RADIANS
    var previousRadianLat = prevLat * degreesToRadians;
    var previousRadianLong = prevLong * degreesToRadians;
    var currentRadianLat = currLat * degreesToRadians;
    var currentRadianLong = currLong * degreesToRadians;
    // CALCULATE RADIAN DELTA BETWEEN THE TWO POSITIONS
    var latitudeRadianDelta = currentRadianLat - previousRadianLat;
    var longitudeRadianDelta = currentRadianLong - previousRadianLong;
    var expr1 = (Math.sin(latitudeRadianDelta / 2) * Math.sin(latitudeRadianDelta / 2)) +
                (Math.cos(previousRadianLat) * Math.cos(currentRadianLat) * 
                    Math.sin(longitudeRadianDelta / 2) * Math.sin(longitudeRadianDelta / 2));
    var expr2 = 2 * Math.atan2(Math.sqrt(expr1), Math.sqrt(1 - expr1));
    var distanceValue = earthRadius * expr2;
    return distanceValue;
}

