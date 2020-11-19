//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);


function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();
  fileDrag.style.border = "none";
  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  fileDrag.style.borderStyle = "none";
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
// var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
var loader = document.getElementById("loader");
var btnSumit = document.getElementById("submit");
var inputLink = document.getElementById("basic-url");

var typeImage = -1; // type:  0-previewFile, 1-previewURL, 2-previewBase64

inputLink.oninput = function() {
  var val = inputLink.value;
  if(checkURL(val)==true)
  {
    previewURL(val);
    typeImage = 1;
    
  } 
  else if(val.length == 0)
  {
    console.log("Yeah!");
    fileDrag.style.border = "0.1rem dashed #d65a31";
    hide(imagePreview);
    show(uploadCaption);
  }
  else 
  {
    typeImage = 2;
    previewImage(val);
  }
}

function checkURL(url) {
return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function convertURL(url)
{
  imagePreview.src = url;
  // var img = new Image();
  // img.setAttribute('crossOrigin', 'anonymous');
  // img.src = url;
  // console.log(img.src);

  var canvas = document.createElement('canvas');
  canvas.width = imageDisplay.naturalWidth;
  canvas.height = imageDisplay.naturalHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(imageDisplay, 0, 0);

  
  var dataURL = canvas.toDataURL("image/jpeg");
  console.log(dataURL);
  return dataURL;
}


function toDataURL(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.responseType = 'blob';
  xhr.onload = function(){
    var fr = new FileReader();
  
    fr.onload = function(){
      callback(this.result);
    };
  
    fr.readAsDataURL(xhr.response); // async call
  };
  
  xhr.send();
}




//========================================================================
// Main button events
//========================================================================

function submitImage() {

  var myListText = document.getElementById('resultCeleb');
  
  if(typeof(myListText) != 'undefined' && myListText != null)
  {
    while (myListText.lastElementChild) {
      myListText.removeChild(myListText.lastElementChild);
    }
  }

  if (!imagePreview.src || !imagePreview.src.startsWith("data")) {
    window.alert("Please select an image before submit.");
    return;
  }

  loader.classList.remove("hidden");
   
  // call the predict function of the backend
  predictImage(imagePreview.src);
  
  btnSumit.disable = true;
}



function clearImage() {
  var myListText = document.getElementById('resultCeleb');

  if(document.body.contains(document.getElementById('celeb'))){
    var myobj = document.getElementById("celeb");
    myobj.remove(); 
  }  
  
  if(typeof(myListText) != 'undefined' && myListText != null)
  {
    while (myListText.lastElementChild) {
      myListText.removeChild(myListText.lastElementChild);
    }
  }

  fileDrag.style.border = "0.1rem dashed #d65a31";

  inputLink.value = ""

  // reset selected files
  fileSelect.value = "";

  // remove image sources and hide them
  imagePreview.src = "";

  hide(imagePreview);
  hide(loader);
  
  show(uploadCaption);
}

function previewURL(link) {
  displayImage(link, "image-preview");
  show(imagePreview);
  hide(uploadCaption);
  fileDrag.style.border = "none";
}

function previewBase64(str){
  fileDrag.style.border = "none";
  displayImage(str, "image-preview");
  show(imagePreview);
  hide(uploadCaption);
}

function previewFile(file) {
  // show the preview of the image
  // console.log(file.name);

  fileDrag.style.border = "none";
  var fileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    displayImage(reader.result, "image-preview");

    show(imagePreview);
    hide(uploadCaption);
  };
}

//========================================================================
// Helper functions
//========================================================================

function predictImage(image) {
  fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(image)

  })
    .then(resp => {
      if (resp.ok)
        resp.json().then(data => {
          
          CreateFaceResult(data);
          CreateListResult(data);
          hide(loader);
          btnSumit.disable = false;
        });
    })
    .catch(err => {
      console.log("An error occured", err.message);
      window.alert("Oops! Something went wrong.");
    });
}

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  console.log.apply(image);
  display.src = image;
  show(display);
}

function displayResult(data) {
  // display the result
  imageDisplay.classList.remove("loading");
  hide(loader);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}

function CreateFaceResult(listData)
{
  var imageBox = document.getElementById("image-box");
  for (i in listData.bboxes)
  {
    var canvas = document.createElement("CANVAS");
    var ctx = x.getContext("2d");
    var w = listData.bboxes[i][2] - listData.bboxes[i][0];
    var h = listData.bboxes[i][3] - listData.bboxes[i][1];

    ctx.drawImage(imagePreview, listData.bboxes[i][0], listData.bboxes[i][1], w, h, 2, 2, w, h);

    imageBox.appendChild(canvas);
  }
  
}


function CreateListResult(listData) {
  var cont = document.getElementById('resultCeleb');
  var h = document.createElement("H3");
  var t = document.createTextNode("Người nổi tiếng: ");
  h.setAttribute('id', 'celeb')
  h.appendChild(t);
  cont.appendChild(h);

  // create ul element and set the attributes.
  var ul1 = document.createElement('ol');

  ul1.setAttribute('style', 'padding-left: 10; margin: 10; text-align: left');
  ul1.setAttribute('id', 'theListCeleb');

  for (i in listData.labels) {
    var li1 = document.createElement('li');     // create li element.
    // draw(listData.color)
    li1.innerHTML = listData.labels[i];      // assigning text to li using array value.
    // li1.style.display = "block";    // remove the bullets.
    // console.log(listData.colors[i][0], listData.colors[i][1], listData.colors[i][2]);
    // color = (listData.colors[i][0], listData.colors[i][1], listData.colors[i][2])
    li1.style.color = "#"+listData.colors[i][2].toString(16)+listData.colors[i][1].toString(16)+listData.colors[i][0].toString(16);

    ul1.appendChild(li1);     // append li to ul.

  }
  cont.appendChild(ul1);       // add list to the container.
}
