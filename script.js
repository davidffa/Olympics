$('document').ready(() => {
    new bootstrap.Carousel('#mainCarousel', {
        interval: 10000
    })



    let on = true;
setInterval(() => {
  if (on) {
    $(".luzes").attr("src","./assets/Redout.png")
  } else {
    $(".luzes").attr("src","./assets/Green out.png")
  }
  on = !on;
}, 500);

});

