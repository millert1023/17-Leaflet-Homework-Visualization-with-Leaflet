// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Define function to create the circle radius based on the magnitude
    function radiusSize(magnitude) {
        return magnitude * 15000;
    }

    // Define function to set the circle color based on the magnitude
    function circleColor(magnitude) {
        if (magnitude <= 1) {
            return "#F0E68C"
        }

        else if (magnitude <= 2) {
            return "#FFFF00"
        }

        else if (magnitude <= 3) {
            return "#FFD700"
        }

        else if (magnitude <= 4) {
            return "#FFA500"
        }

        else if (magnitude <= 5) {
            return "#D2691E"
        }

        else {
            return "#ADFF2F"
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (earthquakeData, latlng) {
            return L.circle(latlng, {
                radius: radiusSize(earthquakeData.properties.mag),
                color: circleColor(earthquakeData.properties.mag),
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define grayscale, satelite and outdoors layers
    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Create the fault line layer
    var faultLine = new L.layerGroup();

    // Query for Fault Line
    var flqueryURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    // Create the function for fault lines and add to fault line layers
    d3.json(flqueryURL, function(data) {
        L.geoJSON(data, {
            style: function() {
                return {
                    color: "orange",
                    fillOpacity: 0}
            }
        }).addTo(faultLine)
    })

     // Define a baseMaps object to hold our base layers
     var baseMaps = {
         "Satellite Map": satellite,
         "Grayscale Map": grayscale,
         "Outdoor Map": outdoors
     };

     // Create overlay object to hold our overlay layer
     var overlayMaps = {
         "Earthquakes": earthquakes,
         "Fault Lines": faultLine,
     };

     // Create our map, giving it the streetmap and earthquakes layers to display on load
     var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3.5,
        layers: [grayscale, earthquakes]
     });

     // Create a layer control
     // Pass in our baseMaps and overlayMaps
     // Add the layer control to the map
     L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
     }).addTo(myMap);

  // color function to be used when creating the legend
  function getColor(i) {
    if (i <= 1) {
        return "#F0E68C"
    }

    else if (i <= 2) {
        return "#FFFF00"
    }

    else if (i <= 3) {
        return "#FFD700"
    }

    else if (i <= 4) {
        return "#FFA500"
    }

    else if (i <= 5) {
        return "#D2691E"
    }

    else {
        return "#ADFF2F"
    }
  }

  // Add the legend
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through to generate a label with color for each interval
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
 
  legend.addTo(myMap);
}
