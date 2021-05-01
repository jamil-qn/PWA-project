var deferredPrompt;

//for support legacy browser
if(!window.Promise){
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("SW registered!");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  installBtn.style.display = "block";
  mainPage.style.display = "none";
  console.log("beforinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});


//create promise object for example
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject({ code: 500, message: "An error occurred!" });
    // resolve('this a executed when timer done!');
  }, 3000);
});

promise.then((text) => console.log(text)).catch((err) => console.log(err));

// ajax example
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://httpbin.org/ip");
xhr.responseType = "json";

xhr.onload = () => {
  console.log(xhr.response);
};
xhr.onerror = () => {
  console.log("error");
};

xhr.send();

//get request example
fetch("https://httpbin.org/ip")
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

//post request example
fetch("https://httpbin.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  mode: "cors",
  body: JSON.stringify({ message: "Does this work?" }),
})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
