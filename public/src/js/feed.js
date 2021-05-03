var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
  createPostArea.style.display = "block";

  // //getting rid of a servie worker
  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //   .then(registeration =>{
  //     for(let i =0 ; i<registeration.length; i++){
  //       registeration[0].unregister();
  //     }
  //   })
  // }
}

// var installBtn = document.querySelector("#installApp-btn");
// var mainPage = document.querySelector(".main-page");
// installBtn.addEventListener("click", () => {
//   if (deferredPrompt) {
//     deferredPrompt.prompt();
//     deferredPrompt.userChoice.then((choiceResuilt) => {
//       console.log("User choice: ", choiceResuilt.outcome);
//       if (choiceResuilt.outcome === "dismissed") {
//         console.log("User Cancelled installition");
//       } else {
//         console.log("User added app to home screen");
//         installBtn.style.display = "none";
//         mainPage.style.display = "block";
//       }

//       deferredPrompt = null;
//     });
//   }
// });

function closeCreatePostModal() {
  createPostArea.style.display = "none";
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

function createCard() {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = "San Francisco Trip";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = "In San Francisco";
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
// fetch("https://httpbin.org/get")
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });


const url = "https://httpbin.org/post";
const networkDataReceived = false;
fetch(url , {
  method: 'POST',
  headers:{
    'Content-Type': 'application/json',
    "Accept": "application/json",
  },
  body:JSON.stringify({
    message : "some message" 
  })

})
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("from web", data);
    clearCards();
    createCard();
  });

if ("caches" in window) {
  caches
    .match(url)
    .then((res) => {
      if (res) {
        return res.json();
      }
    })
    .then((data) => {
      console.log("from cache", data);
      if (!networkDataReceived) {
        clearCards();
        createCard();
      }
    });
}
