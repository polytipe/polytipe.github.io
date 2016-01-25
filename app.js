window.addEventListener('WebComponentsReady', function(e) {

});

function iframe_ready(){
  iframe_document = document.getElementById("app_iframe").contentDocument;
  iframe_content = iframe_document.getElementById("app_content");
}

function crearBoton (){
  //var html = "<paper-input label='Input label'>"+"</paper-input>";
  var html = "<the-keys id='q'>"+"</the-keys>";
  iframe_content.innerHTML = iframe_content.innerHTML + html;
}

function crearPestanas (){
  var element = iframe_document.createElement("poly-tabs");
  iframe_content.appendChild(element);

  var element_properties = element.properties;
  for(var key in element_properties) {
      var value = element_properties[key].value;
      console.log(value);
  }
}
