import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7e2TruYCXBJa0r2u0sENM9WanlX5FZDc",
  authDomain: "fireblogs-f39a4.firebaseapp.com",
  projectId: "fireblogs-f39a4",
  storageBucket: "fireblogs-f39a4.appspot.com",
  messagingSenderId: "71238855608",
  appId: "1:71238855608:web:5405716cd18404ef487d4d"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export{timestamp};
export default firebaseApp.firestore();