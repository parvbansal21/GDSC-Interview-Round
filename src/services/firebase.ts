import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSwu3hM1kakct2jOIbp_EGCfVaxxBe7Yc",
  authDomain: "coding-app-8407d.firebaseapp.com",
  projectId: "coding-app-8407d",
  storageBucket: "coding-app-8407d.firebasestorage.app",
  messagingSenderId: "1097857504898",
  appId: "1:1097857504898:web:157b94905c0348eb04869b",
  measurementId: "G-SDKMLP7LWL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
