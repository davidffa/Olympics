var vm = function () {
  var self = this;
}

$(document).ready(function () {
  console.log("ready!");
  ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
  $("#myModal").modal('hide');
});
