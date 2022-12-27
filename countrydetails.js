// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Countries/');
  self.error = ko.observable('');
  //--- Data Record
  self.Id = ko.observable('');
  self.IOC = ko.observable('');
  self.Name = ko.observable('');
  self.Flag = ko.observable('');
  self.Events = ko.observableArray([]);
  self.Participant = ko.observableArray([]);
  self.Organizer = ko.observableArray([]);

  //--- Page Events
  self.activate = function (id) {
    console.log('CALL: getCountryDetails...');
    var composedUri = self.baseUri() + id;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      self.Id(data.Id);
      self.IOC(data.IOC);
      self.Flag(data.Flag);
      self.Name(data.Name);
      self.Events(data.Events);
      self.Participant(data.Participant);
      self.Organizer(data.Organizer);
      hideLoading();
    });
  };

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

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
})