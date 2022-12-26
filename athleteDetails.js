function prettifyDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${day}/${month}/${year}`;
}

var vm = function () {
  var self = this;

  self.error = ko.observable('');
  self.Name = ko.observable('');
  self.Gender = ko.observable('');
  self.Height = ko.observable('NA');
  self.Weight = ko.observable('NA');
  self.BornDate = ko.observable('');
  self.BornPlace = ko.observable('');
  self.DiedDate = ko.observable('');
  self.DiedPlace = ko.observable('');
  self.Photo = ko.observable('');
  self.OlympediaLink = ko.observable('');
  self.Games = ko.observableArray([]);
  self.Modalities = ko.observableArray([]);
  self.Competitions = ko.observableArray([]);
  self.Medals = ko.observableArray([]);
  self.GoldCount = ko.observable(0);
  self.SilverCount = ko.observable(0);
  self.BronzeCount = ko.observable(0);

  const baseUri = 'http://192.168.160.58/Olympics/api';

  // Page events
  self.activate = function (id) {
    loadAthleteDetails(id);
  }

  function loadAthleteDetails(id) {
    showLoading();
    console.log("CALL: loadAthleteDetails()");

    const composedUri = `${baseUri}/athletes/fulldetails?id=${id}`;
    ajaxHelper(composedUri, 'GET').done((data) => {
      if (data.Photo === null) {
        if (data.Sex === "M") {
          data.Photo = "./assets/male.svg";
        } else {
          data.Photo = "./assets/female.svg"
        }
      }

      if (!isNaN(data.Weight)) {
        data.Weight = data.Weight + " Kg";
      }

      if (!isNaN(data.Height)) {
        data.Height = parseInt(data.Height) / 100 + " m";
      }

      if (data.BornDate != null) {
        data.BornDate = prettifyDate(data.BornDate);
      }

      if (data.DiedDate != null) {
        data.DiedDate = prettifyDate(data.DiedDate);
      }

      for (const medal of data.Medals) {
        console.log(medal);
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

      self.Name(data.Name);
      self.Gender(data.Sex);
      self.Height(data.Height);
      self.Weight(data.Weight);
      self.BornDate(data.BornDate);
      self.BornPlace(data.BornPlace);
      self.DiedDate(data.DiedDate);
      self.DiedPlace(data.DiedPlace);
      self.Photo(data.Photo);
      self.OlympediaLink(data.OlympediaLink);
      self.Games(data.Games);
      self.Modalities(data.Modalities);
      self.Competitions(data.Competitions);
      self.Medals(data.Medals);
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
  var id = getUrlParameter('id');
  console.log(id);
  if (id == undefined)
    window.location.href = "/athletes.html";
  else {
    self.activate(id);
  }
  console.log("VM initialized!");
}

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
});
