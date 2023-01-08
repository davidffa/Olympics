var vm = function () {
  const baseUri = 'http://192.168.160.58/Olympics/api';

  var self = this;

  self.error = ko.observable('');
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
  self.selectedCompetition = ko.observable();
  self.selectCompetition = function (competition) {
    showLoading();
    const composedUri = `${baseUri}/competitions/${competition.Id}`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      if (data.Photo === null)
        data.Photo = './assets/Olympic_Rings_black.svg'
      self.selectedCompetition(data);
      hideLoading();
      $("#detailsModal").modal('show');
    });
  }

  self.favourites = ko.observableArray([]);
  self.toggleFavourite = (competition) => {
    if (self.favourites().find(it => it.Id === competition.Id)) {
      self.favourites.splice(self.favourites().findIndex(it => it.Id === competition.Id), 1)
    } else {
      self.favourites.push(competition);
    }

    localStorage.setItem("fav_competitions", JSON.stringify(self.favourites()));
  }

  /**
   * Carrega os atletas favoritos do local storage
   */
  function loadFavourites() {
    const favs = JSON.parse(localStorage.getItem("fav_competitions"));
    if (favs) {
      self.favourites(favs);
    }
  }

  // Page events
  self.activate = function (id) {
    loadCompetitions(id);
    loadFavourites();
  }

  $("#searchBar").on("input", () => {
    const value = $("#searchBar").val();

    if (value.length >= 3) {
      autoComplete(value);
      // searchModalities(value);
    } else if (value.length === 0) {
      let id = getUrlParameter('page');
      if (id === undefined)
        id = 1;
      loadCompetitions(id);
      $("#searchBar").autocomplete({
        source: []
      });
    }
  });

  // When search button is clicked
  $("#searchBtn").click(() => {
    searchModalities($("#searchBar").val());
  });

  function autoComplete(query) {
    console.log('CALL: searchModalities...');
    const composedUri = `${baseUri}/competitions/searchbyname?q=${query}`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      $("#searchBar").autocomplete({
        source: data.map(it => it.Name)
      });
    });
  }

  function searchModalities(val) {
    console.log('CALL: searchModalities...');
    const composedUri = `${baseUri}/competitions/searchbyname?q=${val}`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      applyImages(data);
      self.records(data);
      self.currentPage(1);
      self.hasNext(false);
      self.hasPrevious(false);
      self.pagesize(data.length)
      self.totalPages(1);
      self.totalRecords(data.length);
      hideLoading();
    });
  }

  function applyImages(data) {
    for (const it of data) {
      if (it.Photo === null)
        it.Photo = './assets/Olympic_Rings_black.svg'
    }
  }

  function loadCompetitions(id) {
    showLoading();
    self.pagesize = ko.observable(20);
    console.log('CALL: getCompetitions...');
    const composedUri = `${baseUri}/competitions?page=${id}&pagesize=${self.pagesize()}`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      applyImages(data.Records);

      self.records(data.Records);
      self.currentPage(data.CurrentPage);
      self.hasNext(data.HasNext);
      self.hasPrevious(data.HasPrevious);
      self.pagesize(data.PageSize)
      self.totalPages(data.TotalPages);
      self.totalRecords(data.TotalRecords);

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
    self.loading(true);
  }
  function hideLoading() {
    $('#myModal').on('shown.bs.modal', function (e) {
      $("#myModal").modal('hide');
    });
    self.loading(false);
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
  let id = getUrlParameter('page');
  if (id === undefined)
    id = 1;
  self.activate(id);
  console.log("VM initialized!");
}

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
});
