// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/countries');
  self.displayName = 'Olympic Countries List';
  self.error = ko.observable('');
  self.passingMessage = ko.observable('');
  self.records = ko.observableArray([]);

  //--- Page Events
  self.activate = function () {
    console.log('CALL: getCountries...');
    var composedUri = `${self.baseUri()}?page=1&pagesize=300`
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      hideLoading();
      for (const record of data.Records) {
        if (record.Flag === null) {
          record.Flag = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Flag_with_question_mark.svg/1200px-Flag_with_question_mark.svg.png?20220807030256';
        }
      }
      self.records(data.Records);
      //self.SetFavourites();
    });

    $("#searchBar").on
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
  self.activate()
  console.log("VM initialized!");
};

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
})