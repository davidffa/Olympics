// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  const baseUri = 'http://192.168.160.58/Olympics/api/games';
  self.displayName = 'Olympic Games editions Map';
  self.error = ko.observable('');
  self.records = ko.observableArray([]);

  let map;
  let loc;

  //--- Page Events
  self.activate = function () {
    console.log('CALL: getGames...');
    var composedUri = `${baseUri}?page=1&pageSize=100`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      self.records(data.Records);

      if (map) {
        setMarkers();
        hideLoading();
      }
    });

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      loc = coords;

      loadMap();

      if (self.records().length > 0) {
        setMarkers();
        hideLoading();
      }
    }, () => alert("Please enable location to use this page"));
  }


  //--- Internal functions
  function setMarkers() {
    for (const game of self.records()) {
      const marker = L.marker([game.Lat, game.Lon]).addTo(map);
      const dist = getDistanceFromLatLonInKm(game.Lat, game.Lon, loc.latitude, loc.longitude);
      marker.bindPopup(`Location: ${game.CityName}, ${game.CountryName}<br/>Distance to your location: ~ ${dist}km<br/>Year: ${game.Year}`);
    }
  }

  function loadMap() {
    map = L.map('map', {
      minZoom: 2,
      maxZoom: 10,
      maxBoundsViscosity: 1.0
    }).setView([loc.latitude, loc.longitude], 5);
    const bounds = L.latLngBounds([[-90, -180], [90, 180]]);
    map.setMaxBounds(bounds);

    // USAR OPENSTREETMAPS SE O MAPBOX NÃO FUNCIONAR!

    // OpenStreetMaps
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 10,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //   noWrap: true
    // }).addTo(map);

    // MapBox
    L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZGF2aWRmZmEiLCJhIjoiY2xjNWJvazJhMDk2cTNuc2E2bXV3MzU2bCJ9.h8NGtvVfph5bKZlx1u3tWw").addTo(map);
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
    $("#myModal").modal('hide');
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