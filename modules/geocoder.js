module.exports = function (Config, Modules) {

    var self = this;
    var Geocoder = {};
    var BullhornAPI = Modules.Bullhorn.API;

    Geocoder.GetBullhornCandidatesByRadiusZip = function (params) {
        var deferred = Modules.Q.defer();
        var distanceInMeters = parseFloat(params.radius) * 1610;
        var lat, lng;

        var parseZip = function (zip) {
            var deferred = Modules.Q.defer();
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(zip) + '&key=AIzaSyAulCcDqS1yK8bBraXKpZlq1z805Z2TOJ4';

            var opts = {
                method: 'GET',
                url: encodeURI(url),
                followAllRedirects: true,
                jar: Modules.cookieJar
            };

            Modules.request(opts, function (err, resp, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    try {
                        var json = JSON.parse(body);
                        if (json.results && json.results.length > 0) {
                            var location = json.results[0].geometry.location;
                            var coordinates = {
                                lat: location.lat,
                                lng: location.lng
                            };
                            deferred.resolve(coordinates);
                        } else {
                            deferred.reject("Failed to parse location");
                        }
                    } catch (e) {
                        deferred.reject(e);
                    }
                }
            });

            return deferred.promise;
        };

        parseZip(params.zip).then(function (coordinates) {
            // old distance 80467
            console.log('Received coordinates', coordinates);
            //const latlng = new spherical.LatLng(28.221569792307694, -81.69681930769234);
            const latlng = new Modules.Spherical.LatLng(coordinates.lat, coordinates.lng);

            var regions = [{direction: 'north', degrees: 0}, {direction: 'northwest', degrees: 315}, {
                direction: 'west',
                degrees: 270
            }, {direction: 'southwest', degrees: 225}, {direction: 'south', degrees: 180}, {
                direction: 'southeast',
                degrees: 135
            }, {direction: 'east', degrees: 90}, {direction: 'northeast', degrees: 45}];
            var geoObject = {};

            for (var i in regions) {
                geoObject[regions[i].direction] = Modules.Spherical.computeOffset(latlng, distanceInMeters, regions[i].degrees);
            }

            //var query = {
            //    "params": {
            //        "type": "search",
            //        "entity": "Candidate",
            //        "queryParams": [{
            //            "isGeocoder": true,
            //            "latOne": geoObject.northwest.lat(),
            //            "latTwo": geoObject.southeast.lat(),
            //            "lngOne": geoObject.northwest.lng(),
            //            "lngTwo": geoObject.southeast.lng()
            //        }]
            //    }
            //};

            var resp = {
                "latOne": geoObject.northwest.lat(),
                "latTwo": geoObject.southeast.lat(),
                "lngOne": geoObject.northwest.lng(),
                "lngTwo": geoObject.southeast.lng()
            };

            deferred.resolve(resp);

            //Modules.Bullhorn.API.query(query).then(function (candidates) {
            //    console.log('queried', candidates);
            //});

        });
        return deferred.promise;
    };

    Geocoder.getCityAndStateFromLocation = function (location) {
        var deferred = Modules.Q.defer();
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(location) + '&key=AIzaSyAulCcDqS1yK8bBraXKpZlq1z805Z2TOJ4';
        var opts = {
            url: url,
            method: "GET",
            agentOptions: {
                securityOptions: 'SSL_OP_NO_SSLv3'
            }
        };
        request(opts, function (err, resp, body) {
            if (err) {
                deferred.reject(err);
            } else {
                try {
                    var preData = JSON.parse(body);
                    var json;
                    json = preData.data;
                    if (!json) {
                        json = preData;
                    }
                    var streetNumber, streetName, city, state, zip;
                    if (json && json.results && json.results.length > 0) {
                        var data = json.results[0].address_components;
                        for (var i in data) {
                            if (data[i].types && data[i].types[0] == 'street_number') {
                                streetNumber = data[i].long_name;
                            }
                            if (data[i].types && data[i].types[0] == 'route') {
                                streetName = data[i].long_name;
                            }
                            if (data[i].types && data[i].types[0] == 'locality') {
                                city = data[i].long_name;
                            }
                            if (data[i].types && data[i].types[0] == 'administrative_area_level_1') {
                                state = data[i].long_name;
                            }
                            if (data[i].types && data[i].types[0] == 'postal_code') {
                                zip = data[i].long_name;
                            }
                        }
                        deferred.resolve({city: city, state: state});
                    } else {
                        deferred.reject("Failed to parse location");
                    }
                }
                catch (e) {
                    deferred.reject(e);
                }
            }
        });

        return deferred.promise;
    };

    return Geocoder;
};