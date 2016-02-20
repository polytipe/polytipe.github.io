window.addEventListener('WebComponentsReady', function(e) {

});

var selected_element;
var element_properties;

function iframe_ready() {
  iframe_document = document.getElementById("app_iframe").contentDocument;
  iframe_content = iframe_document.getElementById("app_content");

  var properties_list = document.getElementById('properties_list');

  iframe_document.addEventListener('regularTap', function(e) {
    selected_element = e.target;
    selected_element.number.value = -1;
    element_properties = selected_element.properties;

    for (var i = 0; i < iframe_content.children.length; i++) {
      //Unfocus all elements except the one active
      if (iframe_content.children[i] != e.target) {
        iframe_content.children[i].unfocus();
      }
    }

    //Clear the properties so they don't add up
    while (properties_list.firstChild) {
      properties_list.removeChild(properties_list.firstChild);
    }

    for (var key in element_properties) {
      //if(!key.startsWith("_")){ //Hide private properties
      if (element_properties[key].type.name == 'Array') {
        //Title of property
        var div = document.createElement("div");
        div.innerHTML = key;
        div.classList.add("property_name");
        properties_list.appendChild(div);

        var array_elements = selected_element[key];
        for (var i = 0; i < array_elements.length; i++) {
          var input = document.createElement("paper-input");
          input.label = (i + 1);
          input.id = key + (i+1);
          input.value = array_elements[i]["name"];
          input.addEventListener("change", propertyChanged);
          input.classList.add("sub_property");
          properties_list.appendChild(input);
        }
      } else if (element_properties[key].type.name == 'Boolean') {
        //Title of property
        var div = document.createElement("div");
        var innerDiv = document.createElement("div");
        innerDiv.innerHTML = key;
        innerDiv.classList.add("flex");
        div.classList.add("property_name", "layout", "horizontal");
        div.appendChild(innerDiv);

        var input = document.createElement("paper-toggle-button");
        if (element_properties[key].value == true) {
          input.checked = true;
        } else {
          input.checked = false;
        }
        input.id = key;
        input.addEventListener("change", propertyChanged);
        div.appendChild(input);
        properties_list.appendChild(div);
      } else if (element_properties[key].type.name == 'Number') {
        var input = document.createElement("paper-input");
        input.label = key;
        input.id = key;
        input.type = "number";
        input.addEventListener("change", propertyChanged);
        input.value = selected_element[key];
        properties_list.appendChild(input);
      }
      //}
    }

  });
}

function propertyChanged() {

  //if(!(this.id).startsWith("_")){ //Hide private properties
    if (element_properties[this.id].type.name == 'Array') {
      console.log("array");
    } else if (element_properties[this.id].type.name == 'Boolean') {
      console.log("bool");
    } else if (element_properties[this.id].type.name == 'Number') {
      selected_element[this.id] = parseInt(this.value);
      console.log("number");
    }
  //}


}

document.addEventListener('propertyChanged', function(e) {
  //selected_element["tab_names"] = [{name: document.getElementById(e.target.id).value}, {name: document.getElementById(e.target.id).value}];
  //console.log(document.getElementById(e.target.id).value);
  //console.log(properties_list.children);
  //selected_element[e.target.id] = document.getElementById(e.target.id).value;

  //console.log(properties_array);

});

function makeElement(element_name) {
  var element = iframe_document.createElement(element_name);
  iframe_content.appendChild(element);
}
