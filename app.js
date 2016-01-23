
window.addEventListener('WebComponentsReady', function(e) {

});

function iframe_ready(){
  iframe_content = document.getElementById("app_iframe").contentDocument.getElementById("app_content");
}

function crearBoton (){
  var html = "<paper-fab icon='add'>"+"</paper-fab>";
  iframe_content.innerHTML = iframe_content.innerHTML + html;
}

function crearPestanas (){
  var html = "<paper-tabs selected='0'>"+"<paper-tab>TAB 1</paper-tab>"
              +"<paper-tab>TAB 2</paper-tab>"+"<paper-tab>TAB 3</paper-tab>"+
              "</paper-tabs>";
  iframe_content.innerHTML = iframe_content.innerHTML + html;
}
