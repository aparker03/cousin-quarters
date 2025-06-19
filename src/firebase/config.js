// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // We’ll use Realtime DB, not analytics

const firebaseConfig = {
  apiKey: "AIzaSyDvFuIqZia3xg-HbyQeYTzPTrdIob54JDg",
  authDomain: "cousin-quarters.firebaseapp.com",
  projectId: "cousin-quarters",
  storageBucket: "cousin-quarters.appspot.com",
  messagingSenderId: "607693664597",
  appId: "1:607693664597:web:22f0c76196758d02f8bfdc",
  databaseURL: "https://cousin-quarters-default-rtdb.firebaseio.com", // you’ll need this
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
