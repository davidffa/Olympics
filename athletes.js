// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/athletes');
  self.displayName = 'Olympic Athletes List';
  self.error = ko.observable('');
  self.passingMessage = ko.observable('');
  self.records = ko.observableArray([]);
  self.currentPage = ko.observable(1);
  self.pagesize = ko.observable(20);
  self.totalRecords = ko.observable(50);
  self.hasPrevious = ko.observable(false);
  self.hasNext = ko.observable(false);
  self.previousPage = ko.computed(function () {
    return self.currentPage() * 1 - 1;
  }, self);
  self.nextPage = ko.computed(function () {
    return self.currentPage() * 1 + 1;
  }, self);
  self.fromRecord = ko.computed(function () {
    return self.previousPage() * self.pagesize() + 1;
  }, self);
  self.toRecord = ko.computed(function () {
    return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
  }, self);
  self.totalPages = ko.observable(0);
  self.pageArray = function () {
    var list = [];
    var size = Math.min(self.totalPages(), 5);
    var step;
    if (size < 5 || self.currentPage() === 1)
      step = 0;
    else if (self.currentPage() >= self.totalPages() - 2)
      step = self.totalPages() - 5;
    else
      step = Math.max(self.currentPage() - 3, 0);

    for (var i = 1; i <= size; i++)
      list.push(i + step);
    return list;
  };
  self.loading = ko.observable(true);

  //--- Page Events
  self.activate = function (id) {
    loadAthletes(id);

    // When searchbar input is modified
    $("#searchBar").on("input", () => {
      const value = $("#searchBar").val();

      if (value.length < 3) {
        if (value.length === 0) {
          loadAthletes(1);
        }
        return;
      }
      searchAthletes(value);
    });

    $("#searchBtn").click(() => {
      searchAthletes($("#searchBar").val());
    });
  };

  function loadAthletes(id) {
    console.log('CALL: getAthletes...');
    var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();

    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);

      applyPhotos(data.Records);

      hideLoading();
      self.records(data.Records);
      self.currentPage(data.CurrentPage);
      self.hasNext(data.HasNext);
      self.hasPrevious(data.HasPrevious);
      self.pagesize(data.PageSize)
      self.totalPages(data.TotalPages);
      self.totalRecords(data.TotalRecords);
      self.loading(false);
      //self.SetFavourites();
    });
  }

  function applyPhotos(records) {
    for (const record of records) {
      if (record.Photo === null) {
        if (record.Sex === "M") {
          record.Photo = "./assets/male.svg";
        } else {
          record.Photo = "./assets/female.svg"
        }
      }
    }
  }

  function searchAthletes(query) {
    const url = `${self.baseUri()}/searchbyname?q=${query}`;

    ajaxHelper(url, 'GET').done((data) => {
      data = data.slice(0, 20);
      applyPhotos(data);

      self.records(data);
      self.totalRecords(20);
      // self.currentPage(data.CurrentPage);
      // self.hasNext(data.HasNext);
      // self.hasPrevious(data.HasPrevious);
      // self.pagesize(data.PageSize)
      // self.totalPages(data.TotalPages);
      // self.totalRecords(data.TotalRecords);
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

  function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;
    console.log("sPageURL=", sPageURL);
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };

  //--- start ....
  showLoading();
  var pg = getUrlParameter('page');
  console.log(pg);
  if (pg == undefined)
    self.activate(1);
  else {
    self.activate(pg);
  }
  console.log("VM initialized!");
};

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
});






// $("searchBar").click(function () {
//   $.get("getPageAddress", function (data, status) {
//   alert("Data: " + data + "\nStatus: " + status);
//   });
// });