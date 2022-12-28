const BASE_URI = "http://192.168.160.58/Olympics/api/statistics";

let loadedData = 0;

function displayChart() {
  const ctx = document.getElementById('chart');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: []
    }
  });

  fetchAthleteStatistics(chart);
  fetchCompetitionStatistics(chart);
  fetchCountriesStatistics(chart);
  fetchModalitiesStatistics(chart);
}

function fetchAthleteStatistics(chart) {
  const composedUri = `${BASE_URI}/games_athletes`;
  ajaxHelper(composedUri, 'GET').done((d) => {
    console.log("CALL: /games_athletes");
    console.log(d);

    const labels = d.map(it => it.Year);
    const data = d.map(it => it.Counter);

    chart.data.labels = labels;
    chart.data.datasets.push({
      label: '#Athletes per olympic games edition',
      data,
      borderColor: "#ffc107",
      tension: 0.2
    });


    if (++loadedData === 4) {
      chart.update();
      hideLoading();
    }
  });
}

function fetchCompetitionStatistics(chart) {
  const composedUri = `${BASE_URI}/games_competitions`;
  ajaxHelper(composedUri, 'GET').done((d) => {
    console.log("CALL: /games_competitions");
    console.log(d);

    const labels = d.map(it => it.Year);
    const data = d.map(it => it.Counter);

    chart.data.labels = labels;
    chart.data.datasets.push({
      label: '#Competitions per olympic games edition',
      data,
      borderColor: "#707071",
      tension: 0.2
    });

    if (++loadedData === 4) {
      chart.update();
      hideLoading();
    }
  });
}

function fetchCountriesStatistics(chart) {
  const composedUri = `${BASE_URI}/games_countries`;
  ajaxHelper(composedUri, 'GET').done((d) => {
    console.log("CALL: /games_countries");
    console.log(d);

    const labels = d.map(it => it.Year);
    const data = d.map(it => it.Counter);

    chart.data.labels = labels;
    chart.data.datasets.push({
      label: '#Countries per olympic games edition',
      data,
      borderColor: "#dc3545",
      tension: 0.2
    });

    if (++loadedData === 4) {
      chart.update();
      hideLoading();
    }
  });
}

function fetchModalitiesStatistics(chart) {
  const composedUri = `${BASE_URI}/games_modalities`;
  ajaxHelper(composedUri, 'GET').done((d) => {
    console.log("CALL: /games_modalities");
    console.log(d);

    const labels = d.map(it => it.Year);
    const data = d.map(it => it.Counter);

    chart.data.labels = labels;
    chart.data.datasets.push({
      label: '#Modalities per olympic games edition',
      data,
      borderColor: "#0d6efd",
      tension: 0.2
    });

    if (++loadedData === 4) {
      chart.update();
      hideLoading();
    }
  });
}

//--- Internal functions
function ajaxHelper(uri, method, data) {
  return $.ajax({
    type: method,
    url: uri,
    dataType: 'json',
    contentType: 'application/json',
    data: data ? JSON.stringify(data) : null,
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX Call[" + uri + "] Fail...");
      hideLoading();
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
  $("#myModal").modal('hide');
}

$(document).ready(() => {
  showLoading();
  displayChart();
});