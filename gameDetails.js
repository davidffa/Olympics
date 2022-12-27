// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  const BASE_URI = 'http://192.168.160.58/Olympics/api';

  var self = this;
  self.error = ko.observable('');
  self.error = ko.observable('');
  self.CountryName = ko.observable('');
  self.Name = ko.observable('');
  self.Year = ko.observable('');
  self.Season = ko.observable('');
  self.City = ko.observable('');
  self.Logo = ko.observable('');
  self.Photo = ko.observable('');
  self.Athletes = ko.observableArray([]);
  self.Modalities = ko.observableArray([]);
  self.Competitions = ko.observableArray([]);
  self.Medals = ko.observableArray([]);
  self.GoldCount = ko.observable(0);
  self.SilverCount = ko.observable(0);
  self.BronzeCount = ko.observable(0);

  const baseUri = 'http://192.168.160.58/Olympics/api';
  //--- Data Record


  //--- Page Events
  self.activate = function (id) {
    console.log('CALL: getGameFullDetails...');
    loadGameFullDetails(id);
  };

  function loadGameFullDetails(id) {
    showLoading();
    console.log("CALL: loadGameFullDetails()");

    const composedUri = `${BASE_URI}/games/fulldetails?id=${id}`;
    ajaxHelper(composedUri, 'GET').done((data) => {
    for (const medal of data.Medals) {
    console.log(medal);
    switch (medal.MedalName) {
      case "Gold":
        self.GoldCount(medal.Counter);
        break;
      case "Silver":
        self.SilverCount(medal.Counter);
        break;
      case "Bronze":
        self.BronzeCount(medal.Counter);
        break;
    }
  }

  console.log(data);

  self.Name(data.Name);
  self.CountryName(data.CountryName);
  self.Year(data.Year);
  self.Season(data.Season);
  self.City(data.City);
  self.Logo(data.Logo);
  self.Photo(data.Photo);
  self.Modalities(data.Modalities);
  self.Competitions(data.Competitions);
  self.Medals(data.Medals);
  hideLoading();
});
}

  //--- Internal functions
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
    $('#myModal').modal('show', {
      backdrop: 'static',
      keyboard: false
    });
  }
  function hideLoading() {
    $('#myModal').on('shown.bs.modal', function (e) {
      $("#myModal").modal('hide');
    })
  }

  function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };

  //--- start ....
  showLoading();
  var pg = getUrlParameter('id');
  console.log(pg);
  if (pg == undefined)
    window.location.href = "./games.html";
  else {
    self.activate(pg);
  }
  console.log("VM initialized!");
};

$(document).ready(function () {
  console.log("document.ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
})
