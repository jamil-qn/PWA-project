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
  // document.querySelector('#install-app').style.transform = "translateY(0)";
  console.log("beforinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});