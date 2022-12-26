// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  const baseUri = 'http://192.168.160.58/Olympics/api';

  var self = this;
  self.error = ko.observable('');
  self.records = ko.observableArray([]);
  self.allRecords = ko.observableArray([]);

  self.selectModality = function (modality) {
    console.log(modality);
  }

  //--- Page Events
  self.activate = function () {
    loadModalities();

    $("#searchBar").on("input", () => {
      const val = $("#searchBar").val();
      self.records(self.allRecords().filter(it => it.Name.toLowerCase().startsWith(val)));
    });
  };

  function loadModalities() {
    const composedUri = `${baseUri}/modalities?page=1&pagesize=70`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);

      self.records(data.Records);
      self.allRecords(data.Records);
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
