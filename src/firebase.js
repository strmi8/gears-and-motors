import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc, // Include getDoc
  setDoc, // Include setDoc
  deleteDoc // Include deleteDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to check if the user is authenticated
const isUserAuthenticated = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists();
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking user authentication:", error);
    return false;
  }
};

// Function to log out the user
const logoutUser = async () => {
  try {
    await auth.signOut();
    // Clear user authentication data from IndexedDB or Firebase's local storage if needed
    // localStorage.removeItem("firebase:authUser:[DEFAULT]");
    // Redirect user to the login page if needed
    // navigate("/login");
  } catch (error) {
    console.error("Error logging out user:", error);
  }
};

export {
  app,
  auth,
  db,
  storage,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  ref,
  uploadBytes,
  getDownloadURL,
  getDoc, // Export getDoc
  setDoc, // Export setDoc
  deleteDoc, // Export deleteDoc
  isUserAuthenticated, // Export isUserAuthenticated
  logoutUser // Export logoutUser
};
