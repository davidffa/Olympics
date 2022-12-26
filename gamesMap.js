var map;
var loc;

const COORDINATES = {
  "Athina": [37.983810, 23.727539],
  "Paris": [48.856614, 2.352222],
  "St. Louis": [38.627003, -90.199404],
  "London": [51.507351, -0.127758],
  "Stockholm": [59.329323, 18.068581],
  "Antwerpen": [51.219447, 4.402464],
  "Chamonix": [45.923611, 6.869444],
  "Amsterdam": [52.370216, 4.895168],
  "Sankt Moritz": [46.499167, 9.829167],
  "Los Angeles": [34.052234, -118.243685],
  "Lake Placid": [44.279167, -73.979167],
  "Berlin": [52.520007, 13.404954],
  "Garmisch-Partenkirchen": [47.483333, 11.133333],
  "Helsinki": [60.169856, 24.938379],
  "Oslo": [59.913869, 10.752245],
  "Melbourne": [-37.814107, 144.963280],
  "Cortina d'Ampezzo": [46.547778, 12.153611],
  "Rome": [41.902783, 12.496366],
  "Squaw Valley": [39.2054083, -120.2567681],
  "Tokyo": [35.689487, 139.691706],
  "Innsbruck": [47.269212, 11.404102],
  "Mexico City": [19.432608, -99.133208],
  "Grenoble": [45.188529, 5.724524],
  "Munich": [48.135125, 11.581981],
  "Sapporo": [43.064167, 141.346944],
  "Montreal": [45.501689, -73.567256],
  "Moskva": [55.755826, 37.617300],
  "Sarajevo": [43.856259, 18.413076],
  "Seoul": [37.566535, 126.977969],
  "Calgary": [51.048615, -114.070846],
  "Barcelona": [41.385064, 2.173403],
  "Albertville": [45.487222, 6.622222],
  "Lillehammer": [61.115833, 10.466667],
  "Atlanta": [33.748995, -84.387982],
  "Nagano": [36.651111, 138.181111],
  "Sydney": [-33.868820, 151.209296],
  "Salt Lake City": [40.760779, -111.891047],
  "Torino": [45.070312, 7.686856],
  "Beijing": [39.904211, 116.407395],
  "Vancouver": [49.282729, -123.120738],
  "Sochi": [43.585525, 39.723062],
  "Rio de Janeiro": [-22.906847, -43.172896]
};

// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  const baseUri = 'http://192.168.160.58/Olympics/api/games';
  self.displayName = 'Olympic Games editions Map';
  self.error = ko.observable('');
  self.records = ko.observableArray([]);

  //--- Page Events
  self.activate = function () {
    console.log('CALL: getGames...');
    var composedUri = `${baseUri}?page=1&pageSize=100`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);

      self.records(data.Records);

      hideLoading();
    });

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      loc = coords;
      loadMap();
    }, () => alert("Please enable location to use this page"));
  }


  //--- Internal functions
  function setMarkers() {
    // Remove as cidades duplicadas, ao usar um Set
    for (const city of [...new Set(self.records().map(r => r.CityName))]) {
      const coordinates = COORDINATES[city];

      if (!coordinates) {
        console.log(`City ${city} not found`);
        continue;
      }
      var marker = L.marker(COORDINATES[city]).addTo(map);
      const dist = getDistanceFromLatLonInKm(coordinates[0], coordinates[1], loc.latitude, loc.longitude);
      const years = self.records().filter(r => r.CityName === city).map(r => r.Year).join(', ');
      marker.bindPopup(`City: ${city}<br/>Distance to your location: ~ ${dist}km<br/>Years: ${years}`);
    }
  }

  function loadMap() {
    map = L.map('map', {
      minZoom: 2,
      maxZoom: 10,
    }).setView([loc.latitude, loc.longitude], 5);

    // OpenStreetMaps
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // MapBox
    // L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZGF2aWRmZmEiLCJhIjoiY2xjNWJvazJhMDk2cTNuc2E2bXV3MzU2bCJ9.h8NGtvVfph5bKZlx1u3tWw")
    //   .addTo(map);
    setMarkers();
  }

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d.toFixed(0);
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  function ajaxHelper(uri, method, data) {
    self.error(''); // Clear error message
    return $.ajax({
      type: method,
      url: uri,
      dataType: 'json',
      contentType: 'application/json',
      data: data ? JSON.stringify(data) : null,
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("AJAX Call[" + uri + "] Fail...");
        hideLoading();
        self.error(errorThrown);
      }
    });
  }

  function showLoading() {
    $("#myModal").modal('show', {
      backdrop: 'static',
      keyboard: false
    });
  }
  function hideLoading() {
    $('#myModal').on('shown.bs.modal', function (e) {
      $("#myModal").modal('hide');
    })
  }

  //--- start ....
  showLoading();
  self.activate();
  console.log("VM initialized!");
};

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
});