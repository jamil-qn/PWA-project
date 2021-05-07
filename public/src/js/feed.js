var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");
var videoPlayer = document.querySelector("#player");
var canvasElement = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var imagePicker = document.querySelector("#image-picker");
var imagePickerArea = document.querySelector("#pick-image");
var picture;
var locationBtn = document.querySelector("#location-btn");
var locationLoader = document.querySelector("#location-loader");
var fetchLocation = { lat: 0, lng: 0 };

locationBtn.addEventListener("click", (event) => {
  if (!("geolocation" in navigator)) {
    return;
  }

  var sawAlert = false;

  locationBtn.style.display = "none";
  locationLoader.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      fetchLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationInput.value = "In Munich";
      document.querySelector("#manual-location").classList.add("is-focused");
    },
    (err) => {
      console.log(err);
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      if (!sawAlert) {
        sawAlert = true;
        alert("Couldn't fetch location, Please enter manually!");
      }
      fetchLocation = { lat: 0, lng: 0 };
    },
    { timeout: 7000 }
  );
});

const initializeLocation = () => {
  if (!("geolocation" in navigator)) {
    locationBtn.style.display = "none";
  }
};

const initializeMedia = () => {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((err) => {
      imagePickerArea.style.display = "block";
    });
};

captureButton.addEventListener("click", (event) => {
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  var context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener("change", (event) => {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  // createPostArea.style.display = "block";
  // setTimeout(()=>{
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)";
  }, 1);
  initializeMedia();
  initializeLocation();
  // },1);

  // //getting rid of a servie worker
  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //   .then(registeration =>{
  //     for(let i =0 ; i<registeration.length; i++){
  //       registeration[1].unregister();
  //     }
  //   })
  // }
}

// var installBtn = document.querySelector("#installApp-btn");
// installBtn.addEventListener("click", () => {
//   if (deferredPrompt) {
//     deferredPrompt.prompt();
//     deferredPrompt.userChoice.then((choiceResuilt) => {
//       console.log("User choice: ", choiceResuilt.outcome);
//       if (choiceResuilt.outcome === "dismissed") {
//         console.log("User Cancelled installition");
//       } else {
//         console.log("User added app to home screen");
//         document.querySelector('#install-app').getElementsByClassName.transform = 'translateY(100vh)';
//       }

//       deferredPrompt = null;
//     });
//   }
// });

function closeCreatePostModal() {
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
    });
  }
  setTimeout(() => {
    createPostArea.style.transform = "translateY(100vh)";
  }, 1);
  captureButton.style.display = "block";
  locationBtn.style.display = "inline";
  locationLoader.style.display = "none";
  //createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// //currently not in use, allows to save assets in cache on demand otherwise
// function onSaveButtonClicked(event) {
//   console.log("clicked");
//   if ("caches" in window) {
//     caches.open("user-requested")
//     .then((cache) =>{
//       cache.add('https://httpbin.org/get');
//       cache.add('/src/images/sf-boat.jpg');
//     });
//   }
// }

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

const updateUI = (datas) => {
  clearCards();
  datas.map((data) => {
    createCard(data);
  });
};

const url = "https://pwagram-a333e-default-rtdb.firebaseio.com/posts.json";
var networkDataReceived = false;
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("from web", data);
    let dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then((data) => {
    if (!networkDataReceived) {
      console.log("from cache", data);
      updateUI(data);
    }
  });
}

const sendData = () => {
  var id = new Date().toISOString();
  var postData = new FormData();
  postData.append("id", id);
  postData.append("title", titleInput.value);
  postData.append("location", locationInput.value);
  postData.append("rawLocationLat", fetchLocation.lat);
  postData.append("rawLocationLng", fetchLocation.lng);
  postData.append("file", picture, id + ".png");
  fetch("https://pwagram-a333e-default-rtdb.firebaseio.com/posts.json", {
    method: "POST",
    body: postData,
  }).then((res) => {
    console.log("Sent data", res);
    updateUI();
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid data!");
    return;
  }
  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture: picture,
        rawLocation: fetchLocation,
      };
      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-posts");
        })
        .then(() => {
          //these code for snackbar feature and show sync message to client
          var snackbarContainer = document.querySelector("#confirmation-toast");
          var data = { message: "Your Post was saved for syncing! " };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    sendData();
  }
});

// if ("caches" in window) {
//   caches
//     .match(url)
//     .then((res) => {
//       if (res) {
//         return res.json();
//       }
//     })
//     .then((data) => {
//       console.log("from cache", data);
//       if (!networkDataReceived) {
//         let dataArray = [];
//         for (var key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray);
//       }
//     });
// }

// fetch("https://httpbin.org/get")
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });
