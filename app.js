var app = document.querySelector("#app");
app.polytipe_section = "sign_in_screen";
app.screen_editor_top_mode = "elements_view";
app.screen_editor_bottom_mode = "editor_properties";

var selected_element;
var element_properties;
var iframeReady = false;

//Preloader

var style = document.createElement("style");
style.textContent = "" + "body {" + "background-color: #303030; margin: 0 auto; width: 100vw; height: 100vh;" + " } \n" + "#pre_loader{" + "margin: 0 auto; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;" + " }";
var head = document.querySelector("head");
head.insertBefore(style, head.firstChild);

var pre_loader = document.createElement("div");
pre_loader.id = "pre_loader";
var loading_icon = document.createElement("div");
loading_icon.innerHTML = "<img src='images/touch/preloader.png'>";
pre_loader.appendChild(loading_icon);
document.body.appendChild(pre_loader);

function iframe_ready() {
  frame.style.opacity = "1";
  document.getElementById('iframe_loading_spinner').style.display = "none";
  iframeReady = true;
  if (typeof iframe_app_content != 'undefined'){
    iframe_app_content.selected = app.selected_screen;
  }

  //Firefox fix for updating the tree on element selection
  if (typeof screen_target == 'undefined') {
    screen_target = iframe_document.getElementById(app.selected_screen);
    if(screen_target != null){
      update_tree();
    }
  }

  //Unfocus all elements when clicking outside the app
  document.getElementById("app_container").addEventListener('click', function(e) {
    if(app.preview_mode){
      return;
    }
    update_tree();
    unfocus(e);
    iframe_document.querySelector('paper-drawer-panel').closeDrawer(); //Close app drawer
  });

  //Add iframe outline
  document.getElementById("app_iframe").classList.add('outlined_element');

  var properties_list = document.getElementById('properties_list');

  drawer_panel = iframe_document.getElementById('drawer_panel');
  drawer_panel.addEventListener('selected-changed', function(e) {
    if(!app.preview_mode){
      app.async(function () { //Wait a little for the drawer_panel.selected to update
        if(drawer_panel.selected == "drawer"){
          iframe_drawer_content.style.border = "2px solid yellow";
          unfocus("main");
        }else if(drawer_panel.selected == "main"){
          iframe_drawer_content.style.border = "none";
          unfocus("drawer");
        }
      },10);
    }
  });

  iframe_document.addEventListener('elementSelection', function(e) {
    selected_element = e.target;
    element_properties = selected_element.properties;

    //Unfocus all elements except the selected_element
    unfocus(e);

    //Update selected item in tree
    if(document.getElementById(selected_element.id) != null){
      document.getElementById(selected_element.id).highlightFolder(e);
    }

    //Remove placeholder when no elements are selected
    document.getElementById('styles_list').style.display = "block";
    document.getElementById('editor_links').style.display = "block";
    document.getElementById('properties_placeholder').style.display = "none";

    //Display element actions
    document.getElementById('element_actions').style.display = "flex";

    //Add inputs for poly-layout elements
    if(selected_element.tagName == "POLY-LAYOUT"){
      for (var key in element_properties) {
        if (element_properties[key].type.name == 'String') {
          //Create dropdowns for every String property
          var dropdown = document.createElement("layout-dropdown");
          dropdown.label = key;
          dropdown.id = key;
          dropdown.value = selected_element[key];
          dropdown.items = selected_element[key+"Dropdown"];
          dropdown.selectedIndex = dropdown.items.indexOf(dropdown.value); //Get index of selected item
          dropdown.addEventListener("iron-select", propertyChanged);
          properties_list.appendChild(dropdown);
        }else if (element_properties[key].type.name == 'Boolean') {
          //Title of property
          var div = document.createElement("div");
          var innerDiv = document.createElement("div");
          innerDiv.innerHTML = key;
          innerDiv.classList.add("flex");
          div.classList.add("property_name", "layout", "horizontal");
          div.appendChild(innerDiv);

          var input = document.createElement("paper-toggle-button");
          input.classList.add("layout", "vertical", "end");
          if (selected_element[key] == true) {
            input.checked = true;
          } else {
            input.checked = false;
          }
          input.id = key;
          input.addEventListener("change", propertyChanged);
          div.appendChild(input);
          properties_list.appendChild(div);
        }
      }
    } else{ //Add inputs for all other elements
      for (var key in element_properties) {
        if (element_properties[key].type.name == 'Array') {
          //Title of property
          var div = document.createElement("div");

          var innerDiv = document.createElement("div");
          innerDiv.innerHTML = key;
          innerDiv.classList.add("flex");
          div.classList.add("property_name", "layout", "horizontal");
          div.appendChild(innerDiv);

          var addButton = document.createElement("paper-fab");
          addButton.icon = "add";
          addButton.title = key;
          addButton.mini = true;
          addButton.classList.add("array_fab");
          addButton.addEventListener("click", arrayChanged);
          div.appendChild(addButton);

          var removeButton = document.createElement("paper-fab");
          removeButton.icon = "remove";
          removeButton.title = key;
          removeButton.mini = true;
          removeButton.classList.add("array_fab");
          removeButton.addEventListener("click", arrayChanged);
          div.appendChild(removeButton);

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
          if(key != "flex"){
            //Title of property
            var div = document.createElement("div");
            var innerDiv = document.createElement("div");
            innerDiv.innerHTML = key;
            innerDiv.classList.add("flex");
            div.classList.add("property_name", "layout", "horizontal");
            div.appendChild(innerDiv);

            var input = document.createElement("paper-toggle-button");
            if (selected_element[key] == true) {
              input.checked = true;
            } else {
              input.checked = false;
            }
            input.id = key;
            input.addEventListener("change", propertyChanged);
            div.appendChild(input);
            properties_list.appendChild(div);
          }
        } else if (element_properties[key].type.name == 'Number') {
          var input = document.createElement("paper-input");
          input.label = key;
          input.id = key;
          input.type = "number";
          input.addEventListener("change", propertyChanged);
          input.min = selected_element.min;
          input.max = selected_element.max;

          input.value = selected_element[key];

          properties_list.appendChild(input);
        } else if (element_properties[key].type.name == 'String') {
          var input;
          if (selected_element[key].length > 30) {
            input = document.createElement("paper-textarea");
            input.maxRows = 2;
          } else{
            input = document.createElement("paper-input");
            input.type = "text";
          }
          input.label = key;
          input.id = key;
          input.addEventListener("change", propertyChanged);
          input.value = selected_element[key];
          properties_list.appendChild(input);
        }
      }
    }
    var element_styles = document.getElementById('styles_list').getElementsByTagName("paper-input");
    for (var i = 0; i < element_styles.length; i++) {
      element_styles[i].value = selected_element[element_styles[i].label];
    }
    document.getElementById('flex_toggle').checked = selected_element["flex"];
    bgPicker.color = selected_element["background-color"];
    colorPicker.color = selected_element["color"];
  });

  //Add event listener when styles are changed
  var style_inputs = document.getElementById('styles_list').querySelectorAll('paper-input');
  for (var i = 0; i < style_inputs.length; i++) {
    style_inputs[i].addEventListener("change", styleChanged);
  }
  document.getElementById('flex_toggle').addEventListener("change", flexChanged);

  //Add event listener when paper-swatch-picker is selected
  bgPicker.addEventListener('color-picker-selected', function () {
    style_inputs[4].value = bgPicker.color;
    selected_element.refreshStyles("background-color", bgPicker.color);
    app.unsaved_changes = true;
  });
  colorPicker.addEventListener('color-picker-selected', function () {
    style_inputs[5].value = colorPicker.color;
    selected_element.refreshStyles("color", colorPicker.color);
    app.unsaved_changes = true;
  });
}

function unfocus(e) {

  var tree_content = document.getElementsByTagName('file-folder');
  for (var i = 0; i < tree_content.length; i++) {
    tree_content[i].classList.remove("selected");
  }

  //Reset selected element
  selected_element = e.target;

  if(!app.preview_mode){
    //Add iframe outline
    if(selected_element != undefined){ //When deleting an element app_iframe has to be outlined
      if(selected_element.id == "app_container" || selected_element.id == "app_folder"){
        iframe_document.querySelector('paper-drawer-panel').closeDrawer();
        iframe_drawer_content.style.border = "none";
        document.getElementById("app_iframe").classList.add('outlined_element');
      } else if(selected_element.id == "drawer_folder"){
        iframe_document.querySelector('paper-drawer-panel').openDrawer();
        iframe_drawer_content.style.border = "2px solid yellow";
        document.getElementById("app_iframe").classList.remove('outlined_element');
      }else{
        iframe_drawer_content.style.border = "none";
        document.getElementById("app_iframe").classList.remove('outlined_element');
      }
    }else{
      if(drawer_panel.selected == "main"){
        document.getElementById("app_iframe").classList.add('outlined_element');
      }
      if(drawer_panel.selected == "drawer"){
        document.getElementById("app_iframe").classList.remove('outlined_element');
      }
    }
  }

  //Add placeholder when no elements are selected
  document.getElementById('element_actions').style.display = "none";
  document.getElementById('styles_list').style.display = "none";
  document.getElementById('editor_links').style.display = "none";
  document.getElementById('properties_placeholder').style.display = "flex";

  //Unfocus all children elements except the one active
  for (var i = 0; i < screen_target.children.length; i++) {
    if (screen_target.children[i] != selected_element) {
      screen_target.children[i].unfocus();
    }
  }
  for (var i = 0; i < iframe_drawer_content.children.length; i++) {
    if (iframe_drawer_content.children[i] != selected_element) {
      iframe_drawer_content.children[i].unfocus();
    }
  }
  //Unfocus children elements with the outlined_element class
  var children = drawer_panel.querySelectorAll(".outlined_element");
  for (var i = 0; i < children.length; i++) {
    if (children[i] != selected_element) {
      children[i].unfocus();
    }
  }

  //Clear the properties so they don't add up
  while (properties_list.firstChild) {
    properties_list.removeChild(properties_list.firstChild);
  }
}

//Update property values using the value of the inputs
function propertyChanged() {
  var arrayName;
  if (/\d/.test(this.id)) { //If the property is an array, remove numbers from id to get property name
    arrayName = (this.id).substr(0, (this.id).length - 2);
  } else {
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
  } else if (element_properties[this.id].type.name == 'Boolean') {
    selected_element[this.id] = this.checked;
  } else if (element_properties[this.id].type.name == 'Number') {
    selected_element[this.id] = parseInt(this.value);
  } else if (element_properties[this.id].type.name == 'String') {
    selected_element[this.id] = this.value;
  }

  app.unsaved_changes = true;
}

function styleChanged() {
  selected_element.refreshStyles(this.label, this.value);
  if (this.label == "color") {
    colorPicker.color = this.value;
  }else{
    bgPicker.color = this.value;
  }
  app.unsaved_changes = true;
}

function flexChanged() {
  selected_element["flex"] = this.checked;
  app.unsaved_changes = true;
}

function clearStyle() {
  //IDEA: Reset styles of selected_element
  document.getElementById('clear_style_toast').show();
}

function arrayChanged() {
  if (this.icon == "add") {
    selected_element.addElement();
  }
  if (this.icon == "remove") {
    selected_element.removeElement();
  }

  app.unsaved_changes = true;
}

/* Element actions */

function makeElement(element_name) {
  if(iframeReady){
    var element = iframe_document.createElement(element_name);
    element_count++;
    element.id = "poly" + element_count;
    if(selected_element == undefined){
      selected_element = document.getElementById('app_container');
    }
    //Adds element inside a layout if any poly-layout element is selected
    if(selected_element != null && selected_element.tagName == "POLY-LAYOUT"){
      Polymer.dom(selected_element).appendChild(element);
      if(element.tagName == "POLY-LAYOUT"){
        element.style.minHeight = "20px";
      }
    }else{
      if(drawer_panel.selected == "drawer"){ //Add to drawer
        if(selected_element.id=="app_container"){
          Polymer.dom(iframe_drawer_content).appendChild(element);
        }
      }else if(drawer_panel.selected == "main"){ //Add to screen
        if(selected_element.id=="app_container"){
          Polymer.dom(screen_target).appendChild(element);
        }
      }
      if(selected_element.id.startsWith("poly")){
        var next_sibling = selected_element.nextSibling;
        if(next_sibling != null){
          while(next_sibling != null && next_sibling.nodeType == 3){
            next_sibling = next_sibling.nextSibling;
          }
          Polymer.dom(selected_element.parentNode).insertBefore(element, selected_element.nextSibling);
        }else{
          Polymer.dom(selected_element.parentNode).appendChild(element);
        }
      }
    }
    //Wait for the element to be appended
    app.async(function () {
      update_tree();
    }, 10);

    app.unsaved_changes = true;
  }
}

//TODO: Prevent elements from triggering the drawer. Make it work on preview mode

function cloneElement() {
  //FIXME: Avoid ID duplicates (priority 5)
  //IDEA: Avoid the need of IDs for creating the tree
  var new_element = selected_element.cloneNode(true);
  element_count++;
  new_element.id = "poly"+element_count;
  new_element.classList.remove("outlined_element");
  Polymer.dom(selected_element.parentNode).insertBefore(new_element, selected_element);
  app.unsaved_changes = true;

  //Wait for the element to be appended
  app.async(function () {
    update_tree();
  }, 10);
}

function deleteElement(e) {
  Polymer.dom(selected_element.parentNode).removeChild(selected_element);

  //Wait for the element to be appended
  app.async(function () {
    update_tree();
  }, 10);

  app.unsaved_changes = true;
  unfocus(document.getElementById("app_container"));
  setTimeout(function(){
    document.getElementById("app_folder").highlightFolder();
  },10);
  if(drawer_panel.selected == "main"){
    document.getElementById("app_iframe").classList.add('outlined_element');
  }
}

function moveElementUp() {
  var previous_sibling = selected_element.previousSibling;
  while(previous_sibling != null && previous_sibling.nodeType == 3){
    previous_sibling = previous_sibling.previousSibling;
  }
  if(previous_sibling != null){
    Polymer.dom(selected_element.parentNode).insertBefore(selected_element, previous_sibling);
  }
  app.unsaved_changes = true;
  //Wait for the element to be appended
  app.async(function () {
    update_tree();
  }, 10);
}

function moveElementDown() {
  var next_sibling = selected_element.nextSibling;
  while(next_sibling != null && next_sibling.nextSibling != null && next_sibling.nextSibling.nodeType == 3){
    next_sibling = next_sibling.nextSibling;
  }
  if(next_sibling != null){
    Polymer.dom(selected_element.parentNode).insertBefore(selected_element, next_sibling.nextSibling);
  }
  app.unsaved_changes = true;
  //Wait for the element to be appended
  app.async(function () {
    update_tree();
  }, 10);
}

/* Tree actions */

function generateTree(node) {
  var treeArray = [];
  var allChildren = node.children;
  for (var i=0; i < allChildren.length; i++) {
    var element_name = allChildren[i].tagName;
    if (element_name != undefined && element_name.startsWith("POLY")){
      var child = node.children[i];
      var obj;

      if(generateTree(child).length > 0){ //If element has children, generate children object
        obj = {"id": allChildren[i].id, "name": element_name, "open": true, "children": generateTree(child)};
      }else{
        obj = {"id": allChildren[i].id, "name": element_name, "open": true};
      }
      treeArray.push(obj);
    }
  }
  return treeArray;
}

function update_tree(){
  //Clear the tree
  var tree_view = document.getElementById('tree_view');
  while (tree_view.firstChild) {
    tree_view.removeChild(tree_view.firstChild);
  }

  var app_tree = document.createElement("file-tree");
  app_tree.identifier = "app_tree";
  app_tree.data = {"id": "app_folder", "name": "main", "open": true, "children": generateTree(screen_target)};
  document.getElementById('tree_view').appendChild(app_tree);

  var drawer_tree = document.createElement("file-tree");
  drawer_tree.identifier = "drawer_tree";
  drawer_tree.data = {"id": "drawer_folder", "name": "drawer", "open": true, "children": generateTree(iframe_drawer_content)};
  document.getElementById('tree_view').appendChild(drawer_tree);
}

function goto(section) {
  if(section == "repos_view"){
    app.selected_repo = "";
  }else if(section == "user_view"){
    app.selected_project = "";
  }else if(section == "project_view"){
    app.selected_screen = "";
  }
  app.polytipe_section = section;
}

/* WebComponentsReady listener */

window.addEventListener('WebComponentsReady', function(e) {
  //Hide loader
  document.getElementById('drawer_panel_wrapper').style.opacity = 1;
  pre_loader.style.display = "none";

  /* Firebase event listeners */

  firebase_element = document.getElementById('firebaseAuth');
  firebase_element.addEventListener('login', function (e) { //On login
    document.getElementById('start_button').style.display = "none";
    document.getElementById('start_button_loading').style.display = "block";
    user_input = app.signed_user.github.username;
    token_input = app.signed_user.github.accessToken;
    github = new Github({
      username: user_input,
      password: token_input,
      auth: "basic"
    });
    validate_user();

    //Get contents from the original polytipe-projects/prototype.html
    var repo = github.getRepo("polytipe", "polytipe-projects");
    repo.read("master", 'prototype.html', function(err, data) {
      split_delimiter = '<paper-drawer-panel id="drawer_panel" disable-swipe force-narrow>';
      split_delimiter_end = '</paper-drawer-panel>';
      project_base_before = data.split(split_delimiter)[0] + split_delimiter + "\n";
      project_base_after = split_delimiter_end + data.split(split_delimiter)[1].split(split_delimiter_end)[1];
    });
  });
  firebase_element.addEventListener('logout', function (e) { //On logout
    document.getElementById('start_button').style.display = "block";
    document.getElementById('start_button_loading').style.display = "none";
    goto('sign_in_screen');
    changeCarousel();
  });

  firebase_element.addEventListener('error', function (e) { //On error
    document.getElementById("sign_in_fail_toast").open();
  });

  /* Selection listeners */

  document.getElementById('left_drawer_menu').addEventListener("iron-select", function (e) {
    document.querySelector('paper-drawer-panel').closeDrawer();
  });
  document.getElementById('repo_selector').addEventListener('iron-select', function () {
    goto('user_view');
    getProjects(function () {});
  });
  document.getElementById('project_selector').addEventListener('iron-select', function () {
    goto('project_view');
    getScreens();
    document.getElementById('iframe_loading_spinner').style.display = "inline-block";
  });
  document.getElementById('screen_selector').addEventListener('iron-select', function (e) {
    goto('screen_editor');
    if(iframeReady){ //Fix for Firefox (only triggers in Chrome)
      screen_target = iframe_document.getElementById(app.selected_screen);
      selected_element = document.getElementById('app_container');
      update_tree();
      editScreen();
    }
  });

  /* Misc listeners */

  app.carousel = 0;
  changeCarousel();
  document.getElementById('carousel_dots').addEventListener("iron-select", function () {
    app.cancelAsync(handle);
    changeCarousel();
  });

  /* Collaborators listeners */

  document.getElementById('collaborators_items').addEventListener("iron-select", function (e) {
    var selected_user = document.getElementById('collaborators_items').selected;
    document.getElementById('collaborators_input').value = selected_user;
    addCollaborator(selected_user);
  });

  collaborators_ajax = document.getElementById('collaborators_ajax');
  collaborators_ajax.addEventListener("response", function () {
    getCollaborators();
    document.getElementById('collaborators_items').selected = "";
    document.getElementById('collaborators_input').value = "";
    app.user_list = [];
  });

  document.getElementById('collaborators_app').addEventListener('dom-change', function() {
    //Add event listener
    var collaborator_chips = document.getElementsByClassName('collaborator_chip');
    for (var i = 0; i < collaborator_chips.length; i++) {
      collaborator_chips[i].addEventListener("remove", function (e) {
        var username = e.target.querySelector('h1').innerHTML;
        removeCollaborator(username);
      });
    }
  });

  /* iron-a11y-keys listeners */

  editor_active_input = false;
  document.getElementById('editor_frame').addEventListener("click", function (e) {
    editor_active_input = false;
  });

  document.getElementById("inputs_frame").addEventListener("click", function () {
    editor_active_input = true;
  });

  document.body.addEventListener("folderSelected", function () {
    editor_active_input = false;
  });

  app.polytipe_target = document.body;
  document.getElementById('polytipe_keys').addEventListener('keys-pressed', function (e) {
    polytipeKeyPressed(e);
  });

  app.preview_mode = false;
  user_repos = [];
});

/* Misc actions */

function changeLIFX() {
  var lifx_color;
  //Change the LIFX bulb color
  switch (app.carousel) {
    case 0:
      lifx_color = "hue:120 saturation:1.0";
      break;
    case 1:
      lifx_color = "hue:70 saturation:1.0";
      break;
    case 2:
      lifx_color = "hue:52 saturation:1.0";
      break;
    case 3:
      lifx_color = "hue:342 saturation:1.0";
      break;
    case 4:
      lifx_color = "hue:265 saturation:1.0";
      break;
    case 5:
      lifx_color = "hue:175 saturation:1.0";
      break;
  }
  //app.lifx_body =  {"power": "on", "color": lifx_color, "brightness":0.8, "duration": 1};
}

function changeCarousel() {
  this.carousel = this.carousel === 5 ? 0 : (this.carousel + 1);
  changeLIFX();
  //Resets the async timeout
  if (typeof handle != 'undefined'){
    app.cancelAsync(handle);
  }
  handle = app.async(changeCarousel, 6000);
}

/* Initialization actions */

function sign_in() {
  document.getElementById('start_button').style.display = "none";
  document.getElementById('start_button_loading').style.display = "block";
  firebase_element.login();
}
function sign_out() {
  firebase_element.logout();
}

function validate_user() {
  user = github.getUser();
  user.show(null, function(err, user) {
    if(err == null){
      app.user_projects = [];
      app.avatar = user["avatar_url"];
      app.name = user["name"];

      //Stop carousel and change the LIFX bulb color
      app.cancelAsync(handle);
      app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};

      app.user = user_input;
      app.token = token_input;
      app.polytipe_section = "repos_view";
      getRepos();
    }else{ //If errors display the fail toast
      document.getElementById("sign_in_fail_toast").open();
    }
  });
}

function getRepos() {
  document.getElementById("loading_repos_box").style.display = "flex";
  document.getElementById("empty_state_repo").style.display = "none";
  user.repos(null, function(err, repos) {
    var personal_repo = false;
    for (var i = 0; i < repos.length; i++) {
      if(repos[i].full_name.includes("polytipe-projects") && repos[i].full_name != "polytipe/polytipe-projects"){
        if(repos[i].owner.login == app.user){
          user_repos.push({"name": repos[i].owner.login, "icon": "folder"});
          personal_repo = true;
        }else{
          user_repos.push({"name": repos[i].owner.login, "icon": "folder-shared"});
        }
      }
    }
    app.user_repos = user_repos;
    document.getElementById("loading_repos_box").style.display = "none";
    if(!personal_repo){
      document.getElementById("empty_state_repo").style.display = "flex";
    }
  });
}

function promptForkRepo() {
  document.getElementById('create_repo_dialog').open();
}

//Forks the the polytipe-projects repo if it doesn't have it
function forkRepo() {
  document.getElementById("forking_spinner").active = true;
  var baseRepo = github.getRepo("polytipe", "polytipe-projects");
  baseRepo.fork(function(err,res) {
    app.toggle_issues_body = {
      "name": "polytipe-projects",
      "has_issues": true
    };
    app.toggle_issues_params = {"access_token": app.token};
    document.getElementById('toggle_issues_ajax').generateRequest();
    user_repos = [];
    user_repos.push({"name": res.owner.login, "icon": "folder"});
    app.user_repos = user_repos;
    document.getElementById("forking_spinner").active = false;
    document.getElementById("loading_repos_box").style.display = "none";
    document.getElementById("empty_state_repo").style.display = "none";
    document.getElementById('create_repo_dialog').close();
    document.getElementById('created_repo_toast').show();
  });
}

//Opens the delete repo dialog
function promptDeleteRepo() {
  var dialog = document.getElementById("delete_repo_dialog");
  dialog.open();
  app.lifx_body =  {"power": "on", "color": "red", "brightness": 0.5, "duration": 1};

  dialog.addEventListener("iron-overlay-canceled", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });

  dialog.addEventListener("iron-overlay-closed", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });
}

//Deletes the polytipe-projects repository from the user
function deleteRepo(){
  document.getElementById("delete_repo_spinner").active = true;
  var naRepo = github.getRepo(app.selected_repo, "polytipe-projects");
  naRepo.deleteRepo(function(err, res) {
    document.getElementById("delete_repo_spinner").active = false;
    var dialog = document.getElementById("delete_repo_dialog");
    dialog.close();
    goto("repos_view");
    user_repos = [];
    app.user_repos = user_repos;
    app.user_projects = [];
    getRepos();
    document.getElementById("empty_state_repo").style.display = "flex";
    document.getElementById("deleted_repo_toast").show();
  });
}

/* Collaborator actions */

function addCollaborator(username) {
  app.user_to_add_delete = username;
  collaborators_ajax.method = "PUT";
  app.collaborators_params = {"access_token": app.token};
}

function removeCollaborator(username) {
  app.user_to_add_delete = username;
  collaborators_ajax.method = "DELETE";
  app.collaborators_params = {"access_token": app.token};
}

function getCollaborators() {
  document.getElementById('collaborators_spinner').active = true;
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.collaborators(function(err, data) {
    app.collaborators = data;
    document.getElementById('collaborators_spinner').active = false;
  });
}

function promptCollaboratorsDialog() {
  app.collaborators = [];
  var collaborators_dialog = document.getElementById('collaborators_dialog');
  collaborators_dialog.open();
  collaborators_dialog.addEventListener("iron-overlay-opened", function () {
    getCollaborators();
  });
}

function searchUsers() {
  var search = github.getSearch(app.user_search);
  search.users(null, function (err, users) {
    if(users.total_count > 0){
      app.user_list = users.items;
      app.empty_search = false;
    }else{
      app.user_list = [];
      app.empty_search = true;
    }
  });
}

/* Commit history actions */

function promptGetCommits() {
  var get_commits_dialog = document.getElementById('get_commits_dialog');
  get_commits_dialog.open();
  get_commits_dialog.addEventListener("iron-overlay-opened", function () {
    getCommits();
  });
}

function getCommits() {
  app.loading_commits = true;
  document.getElementById('commits_view_more').style.display = "none";
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  var options = {
     sha: app.selected_project,
     perpage: 20
  };
  repo.getCommits(options, function(err, commits, xhr) {
    var commit_array = [];
    for (var i = 0; i < commits.length; i++) {
      var url = commits[i].html_url;
      var avatar = commits[i].committer.avatar_url;
      var message = commits[i].commit.message.split("\"\n")[0]; //Get title only
      var date = "Hace " + timeAgo(Date.parse(commits[i].commit.author.date));
      var author = commits[i].author.login;
      commit_array.push({url: url, avatar: avatar, message: message, date: date, author: author});
    }
    app.commits = commit_array;
    app.loading_commits = false;
    document.getElementById('commits_view_more').style.display = "flex";
  });
}

/* Project actions */

function addProjectDialog(){
  var dialog = document.getElementById('add_project_dialog');
  dialog.open();
}

function createProject() {
  var validate_project = document.getElementById('add_project_input').validate();
  if(!validate_project){
    return;
  }
  //Check that the project doesn't exist first
  for (var i=0; i < app.user_projects.length; i++) {
    if(app.project_name == app.user_projects[i]["name"]){
      document.getElementById('project_taken_toast').open();
      return;
    }
  }
  document.getElementById("creating_spinner").active = true;
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.branch(app.project_name, function(err) {
    getProjects(function () {
      document.getElementById("creating_spinner").active = false;

      var dialog = document.getElementById("add_project_dialog");
      dialog.close();

      app.project_name = "";
    });
  });
}

function getProjects(callback) {
  app.user_projects = [];
  document.getElementById("loading_project_box").style.display = "flex";
  document.getElementById("empty_state_project").style.display = "none";
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.listBranches(function(err, branches) {
    var user_projects = [];
    for (var i = 0; i < branches.length; i++) {
      if(branches[i] != "master" && branches[i] != "gh-pages"){
        user_projects.push({"name": branches[i]});
      }
    }
    app.user_projects = user_projects;
    if(app.user_projects.length > 0){
      document.getElementById("empty_state_project").style.display = "none";
    }else{
      document.getElementById("empty_state_project").style.display = "flex";
    }
    document.getElementById("loading_project_box").style.display = "none";
    callback();
  });
}

//Gets elapsed time since last commit
function getLastSaved() {
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  var options = {
     sha: app.selected_project
  };
  repo.getCommits(options, function(err, commits, xhr) {
    app.last_saved = timeAgo(Date.parse(commits[0].commit.author.date));
  });
}

//Opens the save dialog
function promptSaveProject() {
  var dialog = document.getElementById("save_project_dialog");
  dialog.open();
  getLastSaved();
  //El último commit fue hace {{last_saved}}
}

//Makes a commit
function saveProject() {
  var validate_msg = document.getElementById('save_project_input').validate();
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  if(validate_msg){
    document.getElementById('saving_spinner').active = true;
    var temp_dom = Polymer.dom(drawer_panel).innerHTML;
    temp_dom = temp_dom.replace(/ class=".*?"/g, '');
    var beautified_html = vkbeautify.xml(temp_dom, 2);
    beautified_html = beautified_html.replace(/^\s*[\r\n]/gm, "");
    var temp = beautified_html.split("\n");
    for (var i = 0; i < temp.length-1; i++) {
      temp[i] = "    " + temp[i];
    }
    beautified_html = temp.join("\n");
    var merged_html = project_base_before + beautified_html + project_base_after;

    repo.write(app.selected_project, 'prototype.html', merged_html, app.commit_message, function(err) {
        var dialog = document.getElementById("save_project_dialog");
        dialog.close();
        document.getElementById('saving_spinner').active = false;
        app.commit_message = "";
        app.unsaved_changes = false;
    });
  }
}

function promptDeleteProject() {
  var dialog = document.getElementById("delete_project_dialog");
  dialog.open();
  app.lifx_body =  {"power": "on", "color": "red", "brightness": 0.5, "duration": 1};

  dialog.addEventListener("iron-overlay-canceled", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });

  dialog.addEventListener("iron-overlay-closed", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });
}

function deleteProject(){
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.deleteRef('heads/'+app.selected_project, function(err) {

    document.getElementById('app_container').removeChild(frame);

    var dialog = document.getElementById("delete_project_dialog");
    dialog.close();
    goto('user_view');
    getProjects(function () {});
  });
}

function promptLeaveProject() {
  if(app.unsaved_changes){
    var dialog = document.getElementById("leave_project_dialog");
    dialog.open();
    app.lifx_body =  {"power": "on", "color": "red", "brightness": 0.5, "duration": 1};

    dialog.addEventListener("iron-overlay-canceled", function () {
      app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
    });

    dialog.addEventListener("iron-overlay-closed", function () {
      app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
    });
  }else{
    leaveProject();
  }
}

function leaveProject() {
  app.unsaved_changes = false;
  //Reset selected project so iron-select triggers if you select the same project
  document.getElementById('project_selector').selected = "";
  document.getElementById('app_container').removeChild(frame);
  iframeReady = false;

  var dialog = document.getElementById("leave_project_dialog");
  dialog.close();
  goto('user_view');
}

/* Screen actions */

function addScreenDialog(){
  var dialog = document.getElementById('add_screen_dialog');
  dialog.open();
}

function createScreen() {
  var validate_screen = document.getElementById('add_screen_input').validate();
  if(!validate_screen){
    return;
  }
  //Check that the screen isn't a reserved screen name
  var reserved_screen_names = ["main", "drawer", "dialogs", "app", "toasts", "img"];
  for (var i = 0; i < reserved_screen_names.length; i++) {
    if(app.screen_name == reserved_screen_names[i]){
      document.getElementById('screen_reserved_toast').open();
      return;
    }
  }
  //Check that the screen doesn't exist
  for (var i=0; i < app.project_screens.length; i++) {
    if(app.screen_name == app.project_screens[i]["name"]){
      document.getElementById('screen_taken_toast').open();
      return;
    }
  }

  var section = iframe_document.createElement("section");
  section.id = app.screen_name;
  Polymer.dom(iframe_app_content).appendChild(section);
  displayScreens();

  app.unsaved_changes = true;
  app.screen_name = "";
  var dialog = document.getElementById("add_screen_dialog");
  dialog.close();
}
//TODO: Remove focus and unfocus functions from polytipe-projects repo elements
function getScreens() {
  document.getElementById('empty_state_screen').style.display = "none";
  document.getElementById('screen_placeholder').style.display = "flex";
  app.last_saved = "...";
  app.project_screens = [];
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.read(app.selected_project, 'prototype.html', function(err, data) {
    frame = document.createElement("iframe");
    frame.id = "app_iframe";
    frame.style.opacity = "0.05";
    document.getElementById('app_container').appendChild(frame);
    iframe_document = frame.contentDocument || frame.contentWindow.document;

    iframe_document.open();
    iframe_document.write(data);
    iframe_document.close();

    document.getElementById('app_iframe').addEventListener("load", function() {
      iframe_app_content = iframe_document.getElementById("app_content");
      iframe_drawer_content = iframe_document.getElementById("drawer_content");
      selected_iframe_panel = iframe_app_content;

      //Get the highest id number of the elements
      var id_count = Polymer.dom(iframe_app_content).innerHTML.match(/id=".*?"/g);
      if(id_count==null){
        element_count = 0;
      }else{
        //If no numbers are returned
        var number_array = [];
        for (var i = 0; i < id_count.length; i++) {
          if(id_count[i].match(/\d/g)){ //If it's a number
            if(id_count[i].substring(4).slice(0, -1).startsWith("poly")){ //If it's a poly id
              number_array.push(parseInt(id_count[i].substring(8).slice(0, -1)));
            }
          }
        }
        if(number_array.length>0){
          element_count = Math.max.apply(0, number_array);
        }else{
          element_count = 0;
        }
      }

      displayScreens();

      app.iframe_target = iframe_document.body;
      document.getElementById('iframe_keys').addEventListener('keys-pressed', function (e) {
        polytipeKeyPressed(e);
      });
    });
  });
}

function displayScreens() {
  var screens = Polymer.dom(iframe_app_content).children;
  var project_screens = [];
  for (var i=0; i < screens.length; i++) {
    project_screens.push({"name": screens[i].id});
  }
  app.project_screens = project_screens;

  document.getElementById('screen_placeholder').style.display = "none";
  if(app.project_screens.length > 0){
    document.getElementById('empty_state_screen').style.display = "none";
  }else{
    document.getElementById('empty_state_screen').style.display = "flex";
  }
}

function editScreen() {
  iframe_app_content.selected = app.selected_screen;
}

function promptDeleteScreen() {
  var dialog = document.getElementById("delete_screen_dialog");
  dialog.open();
  app.lifx_body =  {"power": "on", "color": "red", "brightness": 0.5, "duration": 1};

  dialog.addEventListener("iron-overlay-canceled", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });

  dialog.addEventListener("iron-overlay-closed", function () {
    app.lifx_body =  {"power": "on", "color": "white kelvin:9000", "brightness": 1.0, "duration": 1};
  });
}

function deleteScreen() {
  var section = iframe_document.getElementById(app.selected_screen);
  Polymer.dom(iframe_app_content).removeChild(section);
  section.remove();

  var dialog = document.getElementById("delete_screen_dialog");
  dialog.close();

  update_tree();
  app.unsaved_changes = true;
  goto('project_view');
  displayScreens();
}

/* Prototype actions */

function gotoPrototype() {
  //Select first screen in the project
  app.selected_screen = document.getElementById('screen_selector').items[0].screen;
  app.polytipe_section = "screen_editor";
  togglePreview();
}

function togglePreview() {
  app.preview_mode = !app.preview_mode;
  var preview_fab = document.getElementById('preview_fab');
  document.getElementById('editor_drawer').forceNarrow = app.preview_mode;

  var all_layouts = iframe_document.querySelectorAll('poly-layout');
  var all_elements = iframe_document.querySelectorAll("[id^='poly']");

  if(app.preview_mode){
    //Remove iframe outline
    document.getElementById("app_iframe").classList.remove('outlined_element');

    //Remove border to poly-layout
    for (var i = 0; i < all_layouts.length; i++) {
      all_layouts[i].style.border = "none";
    }
    //Remove border to poly-elements
    for (var i = 0; i < all_elements.length; i++) {
      all_elements[i].classList.add("no_outlined_element");
    }
    document.getElementById("editor_toolbar").style.backgroundColor = "#2AB767";

    app.lifx_body =  {"power": "on", "color": "green saturation:0.3", "brightness": 1.0, "duration": 0.4};
  }else{
    //Add iframe outline
    if(selected_element != undefined && (selected_element.id == "app_container" || selected_element.id == "app_folder")){
      document.getElementById("app_iframe").classList.add('outlined_element');
    }

    //Add border to poly-layout
    for (var i = 0; i < all_layouts.length; i++) {
      all_layouts[i].style.border = "1px solid #aaa";
    }
    //Add border to poly-elements
    for (var i = 0; i < all_elements.length; i++) {
      all_elements[i].classList.remove("no_outlined_element");
    }
    document.getElementById("editor_toolbar").style.backgroundColor = "#212121";

    app.lifx_body =  {"power": "on", "color": "white", "brightness": 1.0, "duration": 0.4};
  }
}

function promptGeneratePrototype() {
  if(app.unsaved_changes){
    document.getElementById('prototype_unsaved_changes_toast').show();
    return;
  }
  document.getElementById('generate_prototype_dialog').open();
}

var write_index_ready = false;
var write_prototype_ready = false;
var write_manifest_ready = false;
var has_prototype = false;

function generatePrototype() {
  document.getElementById('generating_prototype_spinner').active = true;
  var repo = github.getRepo(app.selected_repo, "polytipe-projects");
  repo.listBranches(function(err, branches) {
    for (var i = 0; i < branches.length; i++) {
      if(branches[i] == "gh-pages"){
        has_prototype = true;
      }
    }
    if(has_prototype){
      repo.read(app.selected_project, 'prototype.html', function(err1, data) {
        repo.write('gh-pages', 'prototype.html', data, "Actualizar prototype.html", function(error) {
          write_prototype_ready = true;
          displayPrototypeToast();
        });
      });
      app.async(function () {
        repo.read('gh-pages', 'index.html', function(err1, data) {
          data = data.replace(/project_name/g, app.selected_project);
          data = data.replace(/usuario/g, app.selected_repo);
          data = data.replace(/avatar_url/g, app.avatar);
          repo.write('gh-pages', 'index.html', data, "Actualizar index.html", function(error) {
            write_index_ready = true;
            displayPrototypeToast();
          });
        });
      }, 1000);

    }else if(!has_prototype){
      repo.branch(app.selected_project, "gh-pages", function(err1) {
        repo.read('gh-pages', 'index.html', function(error, data) {
          data = data.replace(/project_name/g, app.selected_project);
          data = data.replace(/usuario/g, app.selected_repo);
          data = data.replace(/avatar_url/g, app.avatar);
          repo.write('gh-pages', 'index.html', data, "Crear index.html", function(er) {
            write_index_ready = true;
            displayPrototypeToast();
          });
        });
        app.async(function () {
          repo.read('gh-pages', 'manifest.json', function(error, data) {
            data.name = app.selected_project;
            data.short_name = app.selected_project;
            repo.write('gh-pages', 'manifest.json', JSON.stringify(data, null, ' '), "Cambiar nombre de la aplicación en el manifest", function(er) {
              write_manifest_ready = true;
              displayPrototypeToast();
            });
          });
        }, 1000);
      });
    }
  });
}

function displayPrototypeToast() {
  if ((has_prototype && write_index_ready && write_prototype_ready) || (!has_prototype && write_index_ready && write_manifest_ready)) {
    app.lifx_alert =  {"power": "on", "color": "green saturation:1.0", "brightness": 1.0, "period": 1.5, "cycles": 1.0, "persist": false};
    document.getElementById('generating_prototype_spinner').active = false;
    document.getElementById('generate_prototype_dialog').close();
    document.getElementById('prototype_toast').show();
  }
}

//Function for displaying elapsed time since last commit
function timeAgo(time){
  var units = [
    { name: "segundo", limit: 60, in_seconds: 1 },
    { name: "minuto", limit: 3600, in_seconds: 60 },
    { name: "hora", limit: 86400, in_seconds: 3600  },
    { name: "día", limit: 604800, in_seconds: 86400 },
    { name: "semana", limit: 2629743, in_seconds: 604800  },
    { name: "mes", limit: 31556926, in_seconds: 2629743 },
    { name: "año", limit: null, in_seconds: 31556926 }
  ];
  var diff = (new Date() - new Date(time)) / 1000;

  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      var diff =  Math.floor(diff / unit.in_seconds);
      return diff + " " + unit.name + (diff>1 ? "s" : "");
    }
  };
}

//IDEA: On paper-swatch-picker hover change the bulb color

/* Key binding functions */

function polytipeKeyPressed(e) {
  if(app.preview_mode){
    return;
  }
  if(app.polytipe_section == "project_view" || app.polytipe_section == "screen_editor"){
    if((e.detail.combo == "ctrl+s" || e.detail.combo == "meta+s") && app.unsaved_changes){
      e.detail.keyboardEvent.preventDefault();
      promptSaveProject();
    }
  }
  if(app.polytipe_section == "screen_editor"){
    if(!editor_active_input && (e.detail.combo == "delete" || e.detail.combo == "backspace") && selected_element != undefined && selected_element.tagName.startsWith("POLY-")){
      deleteElement(e);
    }
    if((e.detail.combo == "ctrl+d" || e.detail.combo == "meta+d") && selected_element.tagName.startsWith("POLY-")){
      e.detail.keyboardEvent.preventDefault();
      cloneElement();
    }
  }
}
window.onbeforeunload = function(e) {
  if(app.unsaved_changes){
    return 'Salir sin guardar cambios';
  }
};
