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