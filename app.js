var app = document.querySelector("#app");
app.polytipe_section = "sign_in_screen";
app.screen_editor_top_mode = "elements_view";
app.screen_editor_bottom_mode = "editor_properties";

var selected_element;
var element_properties;
var iframeReady = false;

function iframe_ready() {
  iframeReady = true;
  iframe_app_content.selected = app.selected_screen;
  screen_target = iframe_document.getElementById(app.selected_screen);
  //Unfocus all elements when clicking outside the app
  document.getElementById("app_container").addEventListener('click', function(e) {
    unfocus(e);
    document.getElementById("app_folder").selectFolder(e); //Select app folder in tree
    iframe_document.querySelector('paper-drawer-panel').closeDrawer(); //Close app drawer
  });

  //Add iframe outline
  document.getElementById("app_iframe").classList.add('outlined_element');

  var properties_list = document.getElementById('properties_list');

  drawer_panel = iframe_document.getElementById('drawer_panel');
  drawer_panel.addEventListener('selected-changed', function(e) {
    setTimeout(function(){
      if(drawer_panel.selected == "drawer"){
        iframe_drawer_content.style.border = "2px solid yellow";
        selected_iframe_panel = iframe_drawer_content;
        unfocus("main");
      }else if(drawer_panel.selected == "main"){
        iframe_drawer_content.style.border = "none";
        if(selected_iframe_panel == iframe_drawer_content){
          selected_iframe_panel = screen_target;
          unfocus("drawer");
        }
      }
    },1);
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
    document.getElementById('properties_placeholder').style.display = "none";

    //Display element actions
    // TODO: Move up / down in the DOM tree
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
        } else if (element_properties[key].type.name == 'String') {
          var input = document.createElement("paper-input");
          input.label = key;
          input.id = key;
          input.type = "text";
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
    bgPicker.color = selected_element["background"];
    colorPicker.color = selected_element["color"];
  });

  //Add event listener when styles are changed
  var style_inputs = document.getElementById('styles_list').querySelectorAll('paper-input');
  for (var i = 0; i < style_inputs.length; i++) {
    style_inputs[i].addEventListener("change", styleChanged);
  }

  //Add event listener when paper-swatch-picker is selected
  bgPicker.addEventListener('iron-select', function () {
    style_inputs[4].value = bgPicker.color;
    selected_element.updateStyles("background", bgPicker.color);
    app.unsaved_changes = true; //If changes are made, show the save_button
  });
  colorPicker.addEventListener('iron-select', function () {
    style_inputs[5].value = colorPicker.color;
    selected_element.updateStyles("color", colorPicker.color);
    app.unsaved_changes = true; //If changes are made, show the save_button
  });
}

function unfocus(e) {
  var tree_content = document.getElementsByTagName('file-folder');
  for (var i = 0; i < tree_content.length; i++) {
    tree_content[i].classList.remove("selected");
  }

  //Reset selected element
  if(typeof e == "string"){
    if(e == "drawer"){
      for (var i = 0; i < iframe_drawer_content.children.length; i++) {
        iframe_drawer_content.children[i].unfocus();
      }
      unfocus(this);
      document.getElementById("app_folder").highlightFolder();
    }else if(e == "main"){
      document.getElementById('drawer_folder').highlightFolder();
      for (var i = 0; i < screen_target.children.length; i++) {
        screen_target.children[i].unfocus();
      }
    }
  }else{
    selected_element = e.target;
    //Add iframe outline
    if(selected_element != undefined){ //When deleting an element app_iframe has to be outlined
      if(selected_element.id == "app_container" || selected_element.id == "folder_name"){
        document.getElementById("app_iframe").classList.add('outlined_element');
      }else{
        document.getElementById("app_iframe").classList.remove('outlined_element');
      }
    }else{
      document.getElementById("app_iframe").classList.add('outlined_element');
    }

    //Add placeholder when no elements are selected
    document.getElementById('element_actions').style.display = "none";
    document.getElementById('styles_list').style.display = "none";
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
    if (this.id.startsWith("selected")) { //Prevent first position being 0
      selected_element[this.id] = parseInt(this.value) - 1;
    } else {
      selected_element[this.id] = parseInt(this.value);
    }
  } else if (element_properties[this.id].type.name == 'String') {
    selected_element[this.id] = this.value;
  }

  app.unsaved_changes = true; //If changes are made, show the save_button
}

function styleChanged() {
  selected_element.updateStyles(this.label, this.value);
  app.unsaved_changes = true; //If changes are made, show the save_button
}

function arrayChanged() {
  if (this.icon == "add") {
    selected_element.addElement();
  }
  if (this.icon == "remove") {
    selected_element.removeElement();
  }

  app.unsaved_changes = true; //If changes are made, show the save_button
}

//TODO: Get element_count at first and update this number from remote
var element_count = 0;

function makeElement(element_name) {
  if(iframeReady){
    var element = iframe_document.createElement(element_name);
    element_count++;
    element.id = "poly" + element_count;
    //Adds element inside a layout if any poly-layout element is selected
    if(selected_element != null && selected_element.tagName == "POLY-LAYOUT"){
      selected_element.appendChild(element);
      if(element.tagName == "POLY-LAYOUT"){ //When creating poly-layout inside another one set height auto
        element.style.height = selected_element.style.height;
      }
    }else{ //If no poly-layout element is selected add it to the selected screen
      screen_target.appendChild(element);
    }
    update_tree();
    app.unsaved_changes = true; //If changes are made, show the save_button
  }
}

function deleteElement(e) {
  selected_element.remove();
  update_tree();
  app.unsaved_changes = true; //If changes are made, show the save_button
  unfocus(e);
  setTimeout(function(){
    document.getElementById("app_folder").highlightFolder();
  },10);
  if(drawer_panel.selected == "main"){
    document.getElementById("app_iframe").classList.add('outlined_element');
  }
}

function generateTree(node) {
  var treeArray = [];
  var allChildren = node.children;
  for (var i=0; i < allChildren.length; i++) {
    var element_name = allChildren[i].tagName;
    if (element_name != undefined && element_name.startsWith("POLY")){
      if (element_name == "POLY-LAYOUT"){
        var child = node.children[i];
        var obj;

        if(generateTree(child).length > 0){ //If element has children, generate children object
          obj = {"id": allChildren[i].id, "name": element_name, "open": true, "children": generateTree(child)};
        }else{
          obj = {"id": allChildren[i].id, "name": element_name, "open": true};
        }
        treeArray.push(obj);
      }else{
        var obj = {"id": allChildren[i].id, "name": element_name, "open": true};
        treeArray.push(obj);
      }
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
  drawer_tree.data = {"id": "drawer_folder", "name": "drawer", "open": true, "children": generateTree(iframe_document.getElementById("drawer_content"))};
  document.getElementById('tree_view').appendChild(drawer_tree);
}

function goto(section) {
  app.polytipe_section = section;
}

function addScreenDialog(){
  document.getElementById('add_screen_dialog').open();
}
function addProjectDialog(){
  document.getElementById('add_project_dialog').open();
}

/* Github sign in */

function sign_in() {
  firebase_element.login();
}
function sign_out() {
  firebase_element.logout();
}

window.addEventListener('WebComponentsReady', function(e) {
  firebase_element = document.getElementById('firebaseAuth');

  firebase_element.addEventListener('login', function (e) {
    user_input = app.signed_user.github.username;
    token_input = app.signed_user.github.accessToken;

    //Login in Github
    github = new Github({
      username: user_input,
      password: token_input,
      auth: "basic"
    });

    validate_user();

    //Get contents from the original polytipe-projects/index.html
    var repo = github.getRepo("polytipe", "polytipe-projects");
    repo.read("master", 'index.html', function(err, data) {
      split_delimiter = '</iron-pages>';
      project_base_before = data.split(split_delimiter)[0];
      project_base_after = split_delimiter + data.split(split_delimiter)[1];
    });
  });

  firebase_element.addEventListener('logout', function (e) {
    document.querySelector('paper-drawer-panel').closeDrawer();
    goto('sign_in_screen');
  });

  firebase_element.addEventListener('error', function (e) {
    document.getElementById("sign_in_fail_toast").open();
  });

  //Add project selection listener
  document.getElementById('project_selector').addEventListener('iron-select', function () {
    getScreens();
  });

  //Add screen selection listener
  document.getElementById('screen_selector').addEventListener('iron-select', function () {
    if(iframeReady){
      editScreen();
    }
  });

  //Target for iron-a11y-keys
  app.polytipe_target = document.body;
  document.getElementById('polytipe_keys').addEventListener('keys-pressed', function (e) {
    polytipeKeyPressed(e);
  });
});

//Checks if credentials are correct and signs in
function validate_user() {
  user = github.getUser();
  user.show(null, function(err, user) {
    if(err == null){ //If no errors, advance to the next screen

      app.avatar = user["avatar_url"];
      app.name = user["name"];

      app.user = user_input;
      app.polytipe_section = "user_view";
      fork_polytipe_repo();
    }else{ //If errors display the fail toast
      document.getElementById("sign_in_fail_toast").open();
    }
  });
}

//Forks the the polytipe-projects repo if it doesn't have it
function fork_polytipe_repo() {
  document.getElementById("loading_project_box").style.display = "flex";
  var hasProjects = false;
  user.userRepos(app.user, function(err, repos) {
    for (var i = 0; i < repos.length; i++) {
      if(repos[i].name=="polytipe-projects"){
        hasProjects = true;
      }
    }
    if(!hasProjects){
      var baseRepo = github.getRepo("polytipe", "polytipe-projects");
      baseRepo.fork(function(err,res) {
        app.user_projects = [];
        document.getElementById("created_repo_toast").open();
        document.getElementById("loading_project_box").style.display = "none";
        document.getElementById("empty_state_project").style.display = "flex";
      });
    }else{
      getProjects(function () {
        document.getElementById("loading_project_box").style.display = "none";
      });
    }
  });
}

//Opens the delete repo dialog
function promptDeleteRepo() {
  var dialog = document.getElementById("delete_repo_dialog");
  dialog.open();
}
//Deletes the polytipe-projects repository from the user
function deleteRepo(){
  document.getElementById("delete_repo_spinner").active = true;
  var naRepo = github.getRepo(user_input, "polytipe-projects");
  naRepo.deleteRepo(function(err, res) {
    document.getElementById("delete_repo_spinner").active = false;
    var dialog = document.getElementById("delete_repo_dialog");
    dialog.close();
  });
}

/* Project actions */

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
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.branch(app.project_name, function(err) {
    getProjects(function () {
      document.getElementById("creating_spinner").active = false;

      var dialog = document.getElementById("add_project_dialog");
      dialog.close();

      app.project_name = "";
    });
  });
}

//Adds polytipe projects to the user_view
function getProjects(callback) {
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.listBranches(function(err, branches) {
    var user_projects = [];
    for (var i = 0; i < branches.length; i++) {
      if(branches[i] != "master"){
        user_projects.push({"name": branches[i]});
      }
    }
    app.user_projects = user_projects;
    if(app.user_projects.length > 0){
      document.getElementById("empty_state_project").style.display = "none";
    }else{
      document.getElementById("empty_state_project").style.display = "flex";
    }
    callback();
  });
}

//Gets elapsed time since last commit
function getLastSaved() {
  var repo = github.getRepo(user_input, "polytipe-projects");
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
}

//Makes a commit
function saveProject() {
  var validate_msg = document.getElementById('save_project_input').validate();
  var repo = github.getRepo(user_input, "polytipe-projects");
  if(validate_msg){
    document.getElementById('saving_spinner').active = true;
    var merged_html = project_base_before + Polymer.dom(iframe_app_content).innerHTML + project_base_after;
    //Remove selected_element and outlined_element class on save
    //TODO: Fix element class duplicates "x-scope poly-fab-0"
    var no_iron_selected = merged_html.replace(/iron-selected/g, "");
    var new_contents = no_iron_selected.replace(/outlined_element/g, "");
    repo.write(app.selected_project, 'index.html', new_contents, app.commit_message, function(err) {
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
}

function deleteProject(){
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.deleteRef('heads/'+app.selected_project, function(err) {

    document.getElementById('app_container').removeChild(frame);
    app.selected_project = "";

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
  }else{
    leaveProject();
  }
}

function leaveProject() {
  app.unsaved_changes = false; //If changes are made, show the save_button
  //Reset selected project so iron-select triggers if you select the same project
  document.getElementById('project_selector').selected = "";
  document.getElementById('app_container').removeChild(frame);
  iframeReady = false;

  var dialog = document.getElementById("leave_project_dialog");
  dialog.close();
  goto('user_view');
}

/* Screen actions */

function createScreen() {
  var validate_screen = document.getElementById('add_screen_input').validate();
  if(!validate_screen){
    return;
  }
  //Check that the screen doesn't exist first
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

  app.unsaved_changes = true; //If changes are made, show the save_button
  app.screen_name = "";
  var dialog = document.getElementById("add_screen_dialog");
  dialog.close();
}

//TODO: Change single quote ' for double quotes " on array properties from poly-elements

function getScreens() {
  document.getElementById('empty_state_screen').style.display = "none";
  document.getElementById('screen_placeholder').style.display = "flex";
  app.project_screens = [];
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.read(app.selected_project, 'index.html', function(err, data) {
    frame = document.createElement("iframe");
    frame.id = "app_iframe";
    document.getElementById('app_container').appendChild(frame);
    iframe_document = frame.contentDocument || frame.contentWindow.document;

    iframe_document.open();
    iframe_document.write(data);
    iframe_document.close();

    document.getElementById('app_iframe').addEventListener("load", function() {
      iframe_app_content = iframe_document.getElementById("app_content");
      iframe_drawer_content = iframe_document.getElementById("drawer_content");
      selected_iframe_panel = iframe_app_content;
      displayScreens();

      app.iframe_target = iframe_document.body;
      document.getElementById('iframe_keys').addEventListener('keys-pressed', function (e) {
        iframeKeyPressed(e);
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
  screen_target = iframe_document.getElementById(app.selected_screen);
  update_tree();
}
function promptDeleteScreen() {
  var dialog = document.getElementById("delete_screen_dialog");
  dialog.open();
}
function deleteScreen() {
  var section = iframe_document.getElementById(app.selected_screen);
  Polymer.dom(iframe_app_content).removeChild(section);
  section.remove();

  var dialog = document.getElementById("delete_screen_dialog");
  dialog.close();

  update_tree();
  app.unsaved_changes = true; //If changes are made, show the save_button
  app.selected_screen = "";
  goto('project_view');
  displayScreens();
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
//TODO: Add screenshots of the screens
//TODO: Fix editing inputs on screen_editor (backspace is on top of that)
function polytipeKeyPressed(e) {
  e.detail.keyboardEvent.preventDefault();
  //console.log(e.detail.keyboardEvent.key);
  if(e.detail.keyboardEvent.key == "s" && (app.polytipe_section == "project_view" || app.polytipe_section == "screen_editor") && app.unsaved_changes){
    promptSaveProject();
  }
  if(e.detail.keyboardEvent.key == "Backspace" && app.polytipe_section == "screen_editor" && selected_element.tagName.startsWith("POLY-")){
    deleteElement(e);
  }
}
function iframeKeyPressed(e) {
  e.detail.keyboardEvent.preventDefault();
  if(app.polytipe_section == "screen_editor"){
    if(selected_element.tagName.startsWith("POLY-")){
      deleteElement(e);
    }
  }
}
