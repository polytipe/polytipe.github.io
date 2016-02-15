window.addEventListener('WebComponentsReady', function(e) {

});

function iframe_ready() {
  iframe_document = document.getElementById("app_iframe").contentDocument;
  iframe_content = iframe_document.getElementById("app_content");

  var properties_list = document.getElementById('properties_list');

  iframe_document.addEventListener('regularTap', function(e) {
    var selected_element = e.target;
    var element_property_names = Object.keys(selected_element.properties);

    for (var i = 0; i < iframe_content.children.length; i++) {
      //Unfocus all elements except the one active
      if(iframe_content.children[i] != e.target){
        iframe_content.children[i].unfocus();
      }
    }

    //Clear the properties so they don't add up
    while (properties_list.firstChild) {
      properties_list.removeChild(properties_list.firstChild);
    }

    for (var i in element_property_names) {
      //Hide private properties
      if(!element_property_names[i].startsWith("_")){
        if (typeof selected_element[element_property_names[i]] === 'object') {
          for (var j in selected_element[element_property_names[i]]) {
            var input = document.createElement("paper-input");
            input.label = Object.keys(selected_element[element_property_names[i]][j])[0];
            properties_list.appendChild(input);
          }
        } else {
          var input = document.createElement("paper-input");
          input.label = element_property_names[i];
          properties_list.appendChild(input);
        }
      }
    }
  });
}

function makeElement(element_name) {
  var element = iframe_document.createElement(element_name);
  iframe_content.appendChild(element);
}
