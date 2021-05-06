var deferredPrompt;
var enableNotificationButtun = document.querySelectorAll(
  ".enable-notifications"
);

//for support legacy browser
if (!window.Promise) {
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

const displayConfirmNotification = () => {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You successfully subscried to our Notification service",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lag: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };
    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification("Successfully subscribed!", options);
    });
  }
};

const configurePushSub = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub === null) {
        var vapidPublicKey =
          "BAD8YSlHy6yCmh-wkbS39ojK1eoro8RtuYnXz0TIAbrNFU_LJGHfZgYjoy5HK9tX02Jte5pMw27LCDfypZdr36A";
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {
      }
    })
    .then((newSub) => {
      return fetch(
        "https://pwagram-a333e-default-rtdb.firebaseio.com/subscriptions.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub)
        }
      );
    }).then(res =>{
      if(res.ok){
        displayConfirmNotification();
      }
    }).catch(err =>{
      console.log(err);
    })
};

const askForNotificationpermission = () => {
  Notification.requestPermission((result) => {
    console.log("User Choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      console.log("notification permission granted");
      configurePushSub();
      // displayConfirmNotification();
    }
  });
};

if ("Notification" in window && "serviceWorker" in navigator) {
  enableNotificationButtun.forEach((notiBtn) => {
    notiBtn.style.display = "inline-block";
    notiBtn.addEventListener("click", askForNotificationpermission);
  });
}
