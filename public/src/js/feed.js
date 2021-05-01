var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
}

var installBtn = document.querySelector('#installApp-btn');
var mainPage = document.querySelector('.main-page');
installBtn.addEventListener('click' , () =>{
  if(deferredPrompt){
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResuilt =>{
      console.log("User choice: " , choiceResuilt.outcome);
      if(choiceResuilt.outcome === "dismissed"){
        console.log('User Cancelled installition');
      } else{
        console.log('User added app to home screen');
        installBtn.style.display = "none";
        mainPage.style.display = "block";
      }

      deferredPrompt = null;
    })
  }
});

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
