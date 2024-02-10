import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth} from "firebase/auth";
//import AsyncStorage from "@react-native-async-storage/async-storage";
//import * as firebaseAuth from 'firebase/auth';



//const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
const firebaseConfig = {
  apiKey: "AIzaSyDY5rd1oCfL9R6vPyPtucpGfGhR8kYgjdo",
  authDomain: "trackapp-155fa.firebaseapp.com",
  projectId: "trackapp-155fa",
  storageBucket: "trackapp-155fa.appspot.com",
  messagingSenderId: "309944555889",
  appId: "1:309944555889:web:174230099ad18c66fe3ed0",
  measurementId: "G-R0C9DLCB78"
};

 const app = initializeApp(firebaseConfig);
// export  const auth = initializeAuth(app, {
//      persistence : reactNativePersistence(AsyncStorage)
//      }) 
//export const auth = getAuth(app);
export default app;
  
