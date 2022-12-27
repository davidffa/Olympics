// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  const BASE_URI = 'http://192.168.160.58/Olympics/api';

  var self = this;
  self.error = ko.observable('');

  //--- Data Record
  self.CountryName = ko.observable('');
  self.Name = ko.observable('');
  self.Year = ko.observable('');
  self.Season = ko.observable('');
  self.City = ko.observable('');
  self.Logo = ko.observable('');
  self.Photo = ko.observable('');
  self.Athletes = ko.observableArray([]);
  self.AllAthletes = ko.observableArray([]);
  self.searchTerm = ko.observable("");
  self.SearchedAthletes = ko.computed(() => {
    if (self.searchTerm() === "") {
      return self.AllAthletes();
    } else {
      return self.AllAthletes().filter((athlete) => athlete.Name.toLowerCase().startsWith(self.searchTerm()));
    }
  }, self);
  self.Modalities = ko.observableArray([]);
  self.Competitions = ko.observableArray([]);
  self.GoldCount = ko.observable(0);
  self.SilverCount = ko.observable(0);
  self.BronzeCount = ko.observable(0);

  //--- Pagination
  self.currentPage = ko.observable(1);
  self.pagesize = ko.observable(20);
  self.totalRecords = ko.computed(() => {
    return self.SearchedAthletes().length;
  }, self);
  self.totalPages = ko.computed(() => {
    return Math.ceil(self.totalRecords() / self.pagesize());
  }, self);
  self.previousPage = ko.computed(() => {
    return self.currentPage() * 1 - 1;
  }, self);
  self.nextPage = ko.computed(() => {
    return self.currentPage() * 1 + 1;
  }, self);
  self.fromRecord = ko.computed(() => {
    return self.previousPage() * self.pagesize() + 1;
  }, self);
  self.toRecord = ko.computed(() => {
    return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
  }, self);
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

  function updateItems() {
    self.Athletes(self.SearchedAthletes().slice((self.currentPage() - 1) * self.pagesize(), self.currentPage() * self.pagesize()));
  }

  self.moveNextPage = () => {
    self.currentPage(self.nextPage());
    updateItems();
  };
  self.movePrevPage = () => {
    self.currentPage(self.previousPage());
    updateItems();
  };
  self.moveFirstPage = () => {
    self.currentPage(1);
    updateItems();
  };
  self.moveLastPage = () => {
    self.currentPage(self.totalPages());
    updateItems();
  };
  self.moveToPage = (page) => {
    self.currentPage(page);
    updateItems();
  };

  //--- Page Events
  self.activate = function (id) {
    console.log('CALL: getGameFullDetails...');
    loadGameFullDetails(id);

    $("#searchBar").on("input", () => {
      self.currentPage(1);
      self.searchTerm($("#searchBar").val().toLowerCase());

      updateItems();
    });
  };

  function loadGameFullDetails(id) {
    showLoading();
    console.log("CALL: loadGameFullDetails()");

    const composedUri = `${BASE_URI}/games/fulldetails?id=${id}`;
    ajaxHelper(composedUri, 'GET').done((data) => {
      for (const medal of data.Medals) {
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

      applyPhotos(data.Athletes);

      self.Name(data.Name);
      self.CountryName(data.CountryName);
      self.Year(data.Year);
      self.Season(data.Season);
      self.City(data.City);
      self.Logo(data.Logo);
      self.Photo(data.Photo);
      self.Athletes(data.Athletes.slice(0, self.pagesize()));
      self.AllAthletes(data.Athletes);
      self.Modalities(data.Modalities);
      self.Competitions(data.Competitions);

      hideLoading();
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
