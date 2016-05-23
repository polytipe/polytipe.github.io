var style = document.createElement("style");
style.textContent = "" + "body {" + "background-color: #303030; margin: 0 auto; width: 100vw; height: 100vh;" + " } \n" + "#pre_loader{" + "margin: 0 auto; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;" + " }";
var head = document.querySelector("head");
head.insertBefore(style, head.firstChild);

var pre_loader = document.createElement("div");
pre_loader.id = "pre_loader";
var loading_icon = document.createElement("div");
loading_icon.innerHTML = "<img src='app/images/touch/preloader.png'>";
pre_loader.appendChild(loading_icon);
document.body.appendChild(pre_loader);

var app = document.querySelector("#app");
window.addEventListener('WebComponentsReady', function(e) {
  //Hide loader
  document.getElementById('drawer_panel_wrapper').style.opacity = 1;
  pre_loader.style.display = "none";

  app.carousel = 0;
  changeCarousel();
  document.getElementById('carousel_dots').addEventListener("iron-select", function() {
    app.cancelAsync(handle);
    changeCarousel();
  });

  document.getElementById('drawer_menu').addEventListener("iron-activate", function() {
    drawer_panel_wrapper.togglePanel();
  });

  form.addEventListener('iron-form-presubmit', function(event) {
    spinner_box.style.display = "block";
    contact_button.style.display = "none";
  });
  form.addEventListener('iron-form-response', function(event) {
    contact_button.style.display = "block";
    spinner_box.style.display = "none";
    input_name.value = "";
    input_mail.value = "";
    input_message.value = "";
    mail_sent_toast.show();
  });
});

function changeCarousel() {
  this.carousel = this.carousel === 5 ? 0 : (this.carousel + 1);
  //Resets the async timeout
  if (typeof handle != 'undefined') {
    app.cancelAsync(handle);
  }
  handle = app.async(changeCarousel, 10000);
}

function startPlan() {
  document.getElementById('plan_toast').show();
}

function _submit(event) {
  Polymer.dom(event).localTarget.parentElement.submit();
}

function resetSelected() {
  app.selected_tab = null;
}
