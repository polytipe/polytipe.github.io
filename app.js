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
    element_properties = selected_element.properties;

    unfocus(e);

    for (var key in element_properties) {
      //if (!key.startsWith("_")) { //Hide private properties
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
            input.id = key + ("0" + (i + 1)).slice(-2); //00 01 formatting
            for (var pass in array_elements[i]) {
               input.value = array_elements[i][pass];
            }
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
          input.min = selected_element.min;
          input.max = selected_element.max;

          if (key.startsWith("selected")) { //Prevent first position being 0
            input.value = selected_element[key] + 1;
          } else {
            input.value = selected_element[key];
          }
          properties_list.appendChild(input);
        }
      //}
    }

  });
}

//Unfocus all elements when clicking outside the app
document.getElementById("app_container").addEventListener('click', function(e) {
  unfocus(e);
});

function unfocus(e) {
  //Unfocus all elements except the one active
  for (var i = 0; i < iframe_content.children.length; i++) {
    if (iframe_content.children[i] != e.target) {
      iframe_content.children[i].unfocus();
    }
  }
  //Clear the properties so they don't add up
  while (properties_list.firstChild) {
    properties_list.removeChild(properties_list.firstChild);
  }
}


//Update property values using the value of the inputs
function propertyChanged() {
  //if (!(this.id).startsWith("_")) { //Hide private properties

    var arrayName;
    if(/\d/.test(this.id)){ //If the property name has a number (array)
      arrayName = (this.id).substr(0, (this.id).length-2);
    }else{
      arrayName = this.id;
    }

    if (element_properties[arrayName].type.name == 'Array') {
      var jsonArray = [];
      for (var i = 0; i < selected_element[arrayName].length; i++) {
        var jsonObj = {};
        var obj = selected_element[arrayName][i];
        for (var key in obj) {
           jsonObj[key] = document.getElementById(arrayName + ("0" + (i + 1)).slice(-2)).value; //00 01 formatting
        }
        jsonArray.push(jsonObj);
      }
      selected_element[arrayName] = jsonArray;
    }
    else if (element_properties[this.id].type.name == 'Boolean') {
      console.log("TODO: boolean property");
    }
    else if (element_properties[this.id].type.name == 'Number') {
      if (this.id.startsWith("selected")) { //Prevent first position being 0
        selected_element[this.id] = parseInt(this.value) - 1;
      } else {
        selected_element[this.id] = parseInt(this.value);
      }
    }
  //}
}

function makeElement(element_name) {
  var element = iframe_document.createElement(element_name);
  iframe_content.appendChild(element);
}
