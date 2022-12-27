// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  const BASE_URI = 'http://192.168.160.58/Olympics/api';

  var self = this;
  self.error = ko.observable('');
  self.records = ko.observableArray([]);
  self.allRecords = ko.observableArray([]);
  // 0 - Winter 1 - Summer 2 - All
  self.season = ko.observable(2);
  self.selectedGame = ko.observable();
  self.selectGame = function (game) {
    showLoading();

    const url = `${BASE_URI}/games/${game.Id}`;
    ajaxHelper(url, 'GET').done((data) => {
      self.selectedGame(data);
      hideLoading();

      $("#detailsModal").modal('show');
    });
  }

  //--- Page Events
  self.activate = function () {
    console.log('CALL: getGames...');
    var composedUri = `${BASE_URI}/games?page=1&pagesize=100`
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);

      self.allRecords(data.Records);
      self.records(data.Records);
      hideLoading();
    });

    $("#winter").click(() => {
      if (self.season() === 0) {
        self.records(self.allRecords());
        self.season(2);
      } else {
        self.records(self.allRecords().filter(r => r.Name.includes('Winter')));
        self.season(0);
        $("#summer").removeClass("active");
      }
      $("#winter").toggleClass("active");
    });

    $("#summer").click(() => {
      if (self.season() === 1) {
        self.records(self.allRecords());
        self.season(2);
      } else {
        self.records(self.allRecords().filter(r => r.Name.includes('Summer')));
        self.season(1);
        $("#winter").removeClass("active");
      }
      $("#summer").toggleClass("active");
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