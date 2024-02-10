import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth} from "firebase/auth";
//import AsyncStorage from "@react-native-async-storage/async-storage";
//import * as firebaseAuth from 'firebase/auth';



//const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
const firebaseConfig = {
  
};

 const app = initializeApp(firebaseConfig);
// export  const auth = initializeAuth(app, {
//      persistence : reactNativePersistence(AsyncStorage)
//      }) 
//export const auth = getAuth(app);
export default app;
  
