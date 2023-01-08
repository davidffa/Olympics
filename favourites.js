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
  self.error = ko.observable('');

  self.athletes = ko.observableArray([]);
  self.competitions = ko.observableArray([]);
  self.games = ko.observableArray([]);

  self.selectedAthlete = ko.observable();
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
        $("#athleteDetailsModal").modal('show');
      }, 300);
    });
  }
  self.selectedCompetition = ko.observable();
  self.selectCompetition = function (competition) {
    showLoading();
    const composedUri = `${self.baseUri()}/competitions/${competition.Id}`;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      console.log(data);
      if (data.Photo === null)
        data.Photo = './assets/Olympic_Rings_black.svg'
      self.selectedCompetition(data);
      hideLoading();
      $("#competitionDetailsModal").modal('show');
    });
  }
  self.selectedGame = ko.observable();
  self.selectGame = function (game) {
    showLoading();

    const url = `${self.baseUri()}/games/${game.Id}`;
    ajaxHelper(url, 'GET').done((data) => {
      self.selectedGame(data);
      hideLoading();

      $("#gameDetailsModal").modal('show');
    });
  }

  self.removeFavAthlete = (athlete) => {
    self.athletes.splice(self.athletes().findIndex(it => it.Id === athlete.Id), 1)
    localStorage.setItem("fav_athletes", JSON.stringify(self.athletes()));

    $("#athleteDetailsModal").modal("hide");
  }

  self.removeFavCompetition = (competition) => {
    self.competitions.splice(self.competitions().findIndex(it => it.Id === competition.Id), 1)
    localStorage.setItem("fav_competitions", JSON.stringify(self.competitions()));
  }

  self.removeFavGame = (game) => {
    self.games.splice(self.games().findIndex(it => it.Id === game.Id), 1)
    localStorage.setItem("fav_games", JSON.stringify(self.games()));
  }

  /**
   * Carrega os favoritos do local storage
   */
  function loadFavourites() {
    const athletes = JSON.parse(localStorage.getItem("fav_athletes"));
    if (athletes) {
      self.athletes(athletes);
    }

    const competitions = JSON.parse(localStorage.getItem("fav_competitions"));
    if (competitions) {
      self.competitions(competitions);
    }

    const games = JSON.parse(localStorage.getItem("fav_games"));
    if (games) {
      self.games(games);
    }

    console.log("Favourites loaded!");
  }


  //--- Page Events
  self.activate = function () {
    loadFavourites();
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
    });

    $('#myModal').modal('hide');
  }

  //--- start ....
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
