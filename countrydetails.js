// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  const BASE_URI = "http://192.168.160.58/Olympics/api";
  var self = this;
  self.error = ko.observable('');
  //--- Data Record
  self.IOC = ko.observable('');
  self.Name = ko.observable('');
  self.Flag = ko.observable('');
  self.Events = ko.observableArray([]);
  self.Participant = ko.observableArray([]);
  self.Organizer = ko.observableArray([]);
  self.GoldCount = ko.observable(0);
  self.SilverCount = ko.observable(0);
  self.BronzeCount = ko.observable(0);

  //--- Page Events
  self.activate = function (id) {
    loadCountryMedals(id);
    loadCountries(id);
  };

  function loadMedalsChart() {
    const ctx = document.getElementById('chart');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Bronze', 'Silver', 'Gold'],
        datasets: [
          {
            label: 'Medals',
            data: [self.BronzeCount(), self.SilverCount(), self.GoldCount()],
            backgroundColor: ['#cd7f32', '#c0c0c0', '#ffd700'],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Medals'
          }
        }
      },
    });
  }

  function loadCountryMedals(id) {
    console.log('CALL: loadCountryMedals');
    const composedUri = `${BASE_URI}/statistics/medals_country`
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      const country = data.find(it => it.CountryId == id);

      if (!country) {
        hideLoading();
        return;
      }

      const medals = country.Medals;

      self.GoldCount(medals[0].Counter);
      self.SilverCount(medals[1].Counter);
      self.BronzeCount(medals[2].Counter);

      loadMedalsChart();
      hideLoading();
    });
  }

  function loadCountries(id) {
    console.log('CALL: loadCountries');
    const composedUri = `${BASE_URI}/countries/${id}`
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      self.IOC(data.IOC);
      self.Flag(data.Flag);
      self.Name(data.Name);
      self.Events(data.Events);
      self.Participant(data.Participant);
      self.Organizer(data.Organizer);
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
    $("#myModal").modal('hide');
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
    window.location.href = "./countries.html";
  else {
    self.activate(pg);
  }
  console.log("VM initialized!");
};

$(document).ready(function () {
  console.log("document.ready!");
  ko.applyBindings(new vm());
});
