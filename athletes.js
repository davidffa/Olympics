function prettifyDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${day}/${month}/${year}`;
}

// ViewModel KnockOut
var vm = function () {
  console.log('ViewModel initiated...');
  //---Variáveis locais
  var self = this;
  self.baseUri = ko.observable('http://192.168.160.58/Olympics/api');
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
  self.countries = ko.observableArray([]);
  self.selectedCountry = ko.observable('All Countries');
  self.selectedAthlete = ko.observable();
  self.sortBy = ko.observable();
  self.selectAthlete = function (athlete) {
    showLoading();

    const url = `${self.baseUri()}/athletes/${athlete.Id}`;
    ajaxHelper(url, 'GET').done((data) => {
      if (!isNaN(data.Weight)) {
        data.Weight = `${data.Weight} Kg`;
      }
      if (!isNaN(data.Height)) {
        data.Height = `${parseInt(data.Height) / 100} m`;
      }

      if (data.BornDate !== null)
        data.BornDate = prettifyDate(data.BornDate);

      if (data.DiedDate !== null)
        data.DiedDate = prettifyDate(data.DiedDate);

      if (data.Photo === null) {
        if (data.Sex === "M") {
          data.Photo = "./assets/male.svg";
        } else {
          data.Photo = "./assets/female.svg"
        }
      }

      self.selectedAthlete(data);
      hideLoading();

      setTimeout(() => {
        $("#detailsModal").modal('show');
      }, 300);
    });
  }

  // Uma array de objetos de atletas favoritos
  self.favourites = ko.observableArray([]);
  self.toggleFavourite = (athlete) => {
    if (self.favourites().find(it => it.Id === athlete.Id)) {
      self.favourites.splice(self.favourites().findIndex(it => it.Id === athlete.Id), 1)
    } else {
      self.favourites.push(athlete);
    }

    localStorage.setItem("fav_athletes", JSON.stringify(self.favourites()));
  }

  /**
   * Carrega os atletas favoritos do local storage
   */
  function loadFavourites() {
    const favs = JSON.parse(localStorage.getItem("fav_athletes"));
    if (favs) {
      self.favourites(favs);
    }
  }

  let countries;

  //--- Page Events
  self.activate = function (id, countryName, sortBy) {
    loadFavourites();
    self.currentPage(id);
    self.sortBy(sortBy);

    if (countryName)
      self.selectedCountry(countryName);

    // Load countries
    const url = `${self.baseUri()}/countries?page=1&pagesize=300`;
    ajaxHelper(url, 'GET').done((data) => {
      countries = data.Records;
      const countryNames = data.Records.map(c => c.Name);
      countryNames.unshift("All Countries")
      self.countries(countryNames);

      if (countryName && countryName !== 'All Countries') {
        const country = countries.find(c => c.Name === countryName);
        if (!country) {
          loadAthletes(id);
          return;
        }

        $("#countriesSelect").val(countryName).change();
        loadAthletesByCountry(self.currentPage());
      } else {
        loadAthletes(id);
      }

      $("#countriesSelect").change(() => {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('country', $("#countriesSelect").val());
        window.location.search = urlParams;
      });
    });

    if (self.sortBy()) {
      $("#sortBy").val(self.sortBy()).change();
    }

    $("#sortBy").change(() => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('sortBy', $("#sortBy").val());
      window.location.search = urlParams;
    });

    // When searchbar input is modified
    $("#searchBar").on("input", () => {
      const value = $("#searchBar").val();

      if (value.length > 0) {
        $("#countriesSelect").addClass("d-none");
        $("#sortBy").addClass("d-none");
      } else {
        $("#countriesSelect").removeClass("d-none");
        $("#sortBy").removeClass("d-none");
        self.pagesize(20);
      }

      if (value.length <= 3) {
        $("#searchBar").autocomplete({
          source: []
        });

        if (value.length === 0) {
          if (self.selectedCountry() && self.selectedCountry() !== 'All Countries') {
            const country = countries.find(c => c.Name === countryName);
            if (!country) {
              loadAthletes(1);
              return;
            }

            $("#countriesSelect").val(self.selectedCountry()).change();
            loadAthletesByCountry(self.currentPage());
          } else {
            loadAthletes(1);
          }
        }
        return;
      }
      autoComplete(value);
      // searchAthletes(value);
    });

    // When search button is clicked
    $("#searchBtn").click(() => {
      if ($("#searchBar").val().length === 0) return;
      searchAthletes($("#searchBar").val());
    });

    $("#favs").change(() => {
      if ($("#favs").is(":checked")) {
        $("#countriesSelect").addClass("d-none");
        $("#searchContainer").addClass("d-none");
        $("#sortBy").addClass("d-none");
        self.records(self.favourites());
      } else {
        if (self.selectedCountry() && self.selectedCountry() !== 'All Countries') {
          loadAthletesByCountry(1);
        } else if ($("#searchBar").val().length > 0) {
          searchAthletes($("#searchBar").val());
        } else {
          loadAthletes(1, self.selectedCountry());
        }

        $("#countriesSelect").removeClass("d-none");
        $("#searchContainer").removeClass("d-none");
        $("#sortBy").removeClass("d-none");
      }
    });
  };

  function loadAthletes(id) {
    console.log('CALL: getAthletes...');
    var composedUri = `${self.baseUri()}/athletes?page=${id}&pageSize=${self.pagesize()}`;

    if (self.sortBy()) {
      composedUri += `&sortBy=${self.sortBy()}`;
    }

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
    });
  }

  function loadAthletesByCountry(id) {
    console.log('CALL: getAthletesByCountry...');
    const { IOC } = countries.find(c => c.Name === self.selectedCountry());
    var composedUri = `${self.baseUri()}/athletes/byioc?ioc=${IOC}&page=${id}&pageSize=${self.pagesize()}`;

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

  function autoComplete(query) {
    const url = `${self.baseUri()}/athletes/searchbyname?q=${query}`;

    ajaxHelper(url, 'GET').done((data) => {
      data = data.slice(0, 5);

      $("#searchBar").autocomplete({
        source: data.map(d => d.Name),
      });
    });
  }

  function searchAthletes(query) {
    self.loading(true);
    const url = `${self.baseUri()}/athletes/searchbyname?q=${query}`;

    ajaxHelper(url, 'GET').done((data) => {
      data = data.slice(0, 20);
      applyPhotos(data);

      self.records(data);
      self.totalRecords(20);
      self.currentPage(1);
      self.hasNext(false);
      self.hasPrevious(false);
      self.pagesize(data.length)
      self.totalPages(1);
      self.totalRecords(data.length);
      self.loading(false);
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
  var country = getUrlParameter('country');
  var sortBy = getUrlParameter('sortBy');

  if (!['NameUp', 'NameDn', 'HeightUp', 'HeightDn', 'SexUp', 'SexDn', 'BornDateUp', 'BornDateDn', 'DiedDateUp', 'DiedDateDn'].includes(sortBy)) {
    sortBy = null;
  }

  if (country)
    country = country.replaceAll("+", " ");
  console.log(country);
  console.log(pg);
  console.log(sortBy)
  if (pg == undefined)
    self.activate(1, country, sortBy);
  else {
    self.activate(pg, country, sortBy);
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
