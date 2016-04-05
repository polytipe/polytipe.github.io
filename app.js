var app = document.querySelector("#app");
app.polytipe_section = "sign_in_screen";
app.screen_editor_top_mode = "elements_view";
app.screen_editor_bottom_mode = "editor_properties";

var selected_element;
var element_properties;
var iframeReady = false;

function iframe_ready() {
  //Unfocus all elements when clicking outside the app
  document.getElementById("app_container").addEventListener('click', function(e) {
    unfocus(e);
    document.getElementById("app_folder").selectFolder(e); //Select app folder in tree
    iframe_document.querySelector('paper-drawer-panel').closeDrawer(); //Close app drawer
  });

  iframeReady = true;
  iframe_document = document.getElementById("app_iframe").contentDocument;
  iframe_app_content = iframe_document.getElementById("app_content");
  iframe_drawer_content = iframe_document.getElementById("drawer_content");
  selected_iframe_panel = iframe_app_content;

  //Display ready toast
  document.getElementById("ready_toast").open();

  //Create tree and highlight main folder on ready
  update_tree();
  setTimeout(function(){
    document.getElementById("app_folder").highlightFolder();
  },10);

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
        selected_iframe_panel = iframe_app_content;
        unfocus("drawer");
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

    //Element actions
    // TODO: Move up / down in the DOM tree
    var div = document.createElement("div");
    div.id = "element_actions";
    div.classList.add("layout", "horizontal", "end-justified");

    var moveUpButton = document.createElement("paper-fab");
    moveUpButton.title = "Mover arriba";
    moveUpButton.classList.add("move_button");
    moveUpButton.icon = "arrow-upward";
    div.appendChild(moveUpButton);

    var moveDownButton = document.createElement("paper-fab");
    moveDownButton.title = "Mover abajo";
    moveDownButton.classList.add("move_button");
    moveDownButton.icon = "arrow-downward";
    div.appendChild(moveDownButton);

    var divFlex = document.createElement("div");
    divFlex.classList.add("flex");
    div.appendChild(divFlex);

    var deleteButton = document.createElement("paper-fab");
    deleteButton.title = "Eliminar elemento";
    deleteButton.id = "delete_button";
    deleteButton.icon = "delete";
    deleteButton.addEventListener("click", deleteElement);
    div.appendChild(deleteButton);

    properties_list.appendChild(div);

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
      for (var i = 0; i < iframe_app_content.children.length; i++) {
        iframe_app_content.children[i].unfocus();
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
    document.getElementById('styles_list').style.display = "none";
    document.getElementById('properties_placeholder').style.display = "flex";

    //Unfocus all children elements except the one active
    for (var i = 0; i < iframe_app_content.children.length; i++) {
      if (iframe_app_content.children[i] != selected_element) {
        iframe_app_content.children[i].unfocus();
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
}

function styleChanged() {
  selected_element.updateStyles(this.label, this.value);
}

function arrayChanged() {
  if (this.icon == "add") {
    selected_element.addElement();
  }
  if (this.icon == "remove") {
    selected_element.removeElement();
  }
}

var element_count = 0;

function makeElement(element_name) {
  if(iframeReady){
    var element = iframe_document.createElement(element_name);
    element_count++;
    element.id = "poly" + element_count;
    //Adds element inside a layout if any poly-layout element is selected
    if(selected_element != null && selected_element.tagName == "POLY-LAYOUT"){
      selected_element.appendChild(element);
    }else{ //If no poly-layout element is selected add it to the main container
      selected_iframe_panel.appendChild(element);
    }
    update_tree();
  }
}

function deleteElement(e) {
  selected_element.remove();
  update_tree();
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
  app_tree.data = {"id": "app_folder", "name": "main", "open": true, "children": generateTree(iframe_document.getElementById("app_content"))};
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

function keyDown(event) { //Sign in when pressing enter in the token input
  if (event.keyCode == 13) {
    sign_in();
  }
}

//Validates the inputs and creates the Github object
function sign_in() {
  var valid_user = document.getElementById('sign_in_user').validate();
  var valid_token = document.getElementById('sign_in_token').validate();
  if(!valid_user || !valid_token){
    return;
  }
  user_input = document.getElementById('sign_in_user').value;
  token_input = document.getElementById('sign_in_token').value;

  github = new Github({
    username: user_input,
    password: token_input,
    auth: "basic"
  });

  validate_user();
}

window.addEventListener('WebComponentsReady', function(e) {
  user_input = "alejost848";
  token_input = "";

  //Login in Github
  github = new Github({
      token: token_input,
      auth: "oauth"
  });
  validate_user();
});

//Checks if credentials are correct and signs in
function validate_user() {
  user = github.getUser();
  user.notifications(function(err, notifications) {
    if(err == null){ //If no errors, advance to the next screen
      user.show(null, function(err, user) {
        app.avatar = user["avatar_url"];
      });
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
  document.getElementById("new_project_fab").style.display = "none";
  document.getElementById("loading_projects_box").style.display = "flex";
  document.getElementById("loading_projects_text").style.display = "none";
  var hasProjects = false;
  user.repos(function(err, repos) {
    for (var i = 0; i < repos.length; i++) {
      if(repos[i]["full_name"] == user_input + "/polytipe-projects"){
        hasProjects = true;
      }
    }
    if(!hasProjects){
      var baseRepo = github.getRepo("polytipe", "polytipe-projects");
      baseRepo.fork(function(err,res) {
        document.getElementById("created_repo_toast").open();
      });
    }else{
      getProjects();
    }
    document.getElementById("new_project_fab").style.display = "flex";
    document.getElementById("loading_projects_box").style.display = "none";
    document.getElementById("loading_projects_text").style.display = "flex";
  });
}

function createProject() {
  document.getElementById("new_project_fab").style.display = "none";
  document.getElementById("loading_projects_box").style.display = "flex";
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.branch(app.project_name, function(err) {
    document.getElementById("new_project_fab").style.display = "flex";
    document.getElementById("loading_projects_box").style.display = "none";
    getProjects();
  });
}
//Adds polytipe projects to the user_view
function getProjects() {
  var repo = github.getRepo(user_input, "polytipe-projects");
  repo.listBranches(function(err, branches) {
    var user_projects = [];
    for (var i = 0; i < branches.length; i++) {
      if(branches[i] != "master"){
        user_projects.push({"name": branches[i]});
      }
    }
    app.user_projects = user_projects;
  });
}
function deleteProject(){
  var naRepo = github.getRepo(user_input, "polytipe-projects");
  naRepo.deleteRepo(function(err, res) {});
}

function createScreen() {

}
