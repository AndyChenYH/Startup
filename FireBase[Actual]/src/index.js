import { initializeApp } from "firebase/app"
import{getFirestore, collection, getDocs} from 'firebase/firestore'
import { getStorage, ref, uploadBytes,storage, getDownloadURL } from "firebase/storage";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBZ8xuLCF-LLVVntRxTeKFwhlzOTcPD_10",
    authDomain: "mvp1-354320.firebaseapp.com",
    databaseURL: "https://mvp1-354320-default-rtdb.firebaseio.com",
    projectId: "mvp1-354320",
    storageBucket: "mvp1-354320.appspot.com",
    messagingSenderId: "964914698088",
    appId: "1:964914698088:web:be117e87a9d2cd5445e8dd",
    measurementId: "G-LTH8HR8B6F"
  };
  const app = initializeApp(firebaseConfig)

  document.getElementById('submit').onclick = function(){
    //File upload
    let input = document.querySelector("input").files[0]
    console.log(input);
    const storage = getStorage();
    const storageRef = ref(storage,"Parts/"+input.name);
    uploadBytes(storageRef, input).then((snapshot) => {
        alert("Uploaded File")
      }).catch(err =>{
        alert(err.message)
      });
    
}
document.getElementById('pull').onclick = function(){
    //File upload
    // Create a reference to the file we want to download
    const searchName = document.getElementById('titleBox').value
    const storage = getStorage();
    const objRef = ref(storage, 'Parts/'+searchName);

    // Get the download URL
    getDownloadURL(objRef)
    .then((url) => {
    // Insert url into an <img> tag to "download"
    console.log(url)
    })
    .catch((error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
        case 'storage/object-not-found':
            alert(error)
            break;
        case 'storage/unauthorized':
        // User doesn't have permission to access the object
            break;
        case 'storage/canceled':
        // User canceled the upload
            break;

        // ...

        case 'storage/unknown':
        // Unknown error occurred, inspect the server response
            break;
    }
    });
    
}

