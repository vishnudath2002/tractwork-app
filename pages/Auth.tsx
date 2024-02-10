import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Text, Provider as PaperProvider } from 'react-native-paper';
//import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import  app  from '../firebase/firebaseConfig';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Auth: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  
  const db = getFirestore(app);

  const handleSignUp = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter Username');
        return;
      }
  
      // Check if the worker already exists in the "users" collection
      const usersCollection = collection(db, 'users');
      const emailQuery = query(usersCollection, where('Worker', '==', email));
      const querySnapshot = await getDocs(emailQuery);
  
      if (!querySnapshot.empty) {
        Alert.alert('Error', 'User already exists. Please choose a different username.');
        return;
      }
  
      // Worker does not exist, proceed with sign-up
      setEmail('');
      Alert.alert('Success', 'Sign up successful');
      navigation.navigate('User', {
        worker: email,
      });
    } catch (err: any) {
      Alert.alert('Error', 'Invalid Username ');
    }
  };
  

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter Username');
      return;
    }
  
    if (email === 'SREENI') {
      setEmail('');
      // You might want to include a password check here in the future
      navigation.navigate('Home');
    } else {
      try {
        const usersCollection = collection(db, 'users');
        const emailQuery = query(usersCollection, where('Worker', '==', email));
        const querySnapshot = await getDocs(emailQuery);
  
        if (!querySnapshot.empty) {
          // You might want to include a password check here in the future
          setEmail('');
          Alert.alert('Success', 'Sign in successful');
          navigation.navigate('User', {
            worker: email,
          });
        } else {
          Alert.alert('Error', 'Invalid Username ');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message);
      }
    }
  };
  

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TextInput
          mode="outlined"
          label="User Name"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        
        <View style={styles.buttonContain}>
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>
          <Button mode="contained" onPress={handleSignUp} style={styles.button}>
            Sign Up
          </Button>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  buttonContain: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
  },
});

export default Auth;
