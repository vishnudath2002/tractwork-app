import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import app from '../firebase/firebaseConfig';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import {
  FAB,
  TextInput,
  Button,
  RadioButton,
  Text,
  List,
  Card,
  Searchbar,
  IconButton,
  Menu,
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
//import { getAuth, deleteUser  } from "firebase/auth";

const db = getFirestore(app);
//const auth = getAuth();

const Home: React.FC<{ navigation: any, route: any }> = ({ navigation, route}) => {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [vehicle, setVehicle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  
  const [isWorkerMenuVisible, setIsWorkerMenuVisible] = useState(false);
  const [worker, setWorker] = useState<string | null>(null);

  const [transportFee, setTransportFee] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});



  const uniqueWorkers = new Set<string>();



  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);

    });

    return () => unsubscribe();
  }, [navigation, setIsEditing]);

  



  type Task = {
    id: string;
    name?: string;
    date?: Timestamp | null;
    Worker?: string;
    time?: string;
    vehicle?: string[];
    location?: string;
    amount?: string;
    transportFee?: string;
  };

  const resetFields = () => {
    setName('');
    setDate(null);
    setTime('');
    setLocation('');
    setVehicle('');
    setAmount('');
    setWorker('');
    setTransportFee('');
  };

  const addOrUpdateTask = async () => {
    try {
      // Validate fields
      const validationErrors: Record<string, string> = {};
      if (!name) validationErrors.name = 'Name is required';
      if (!date) validationErrors.date = 'Date is required';
      if (!time) validationErrors.time = 'Time is required';
      if (!location) validationErrors.location = 'Location is required';
      if (!amount) validationErrors.amount = 'Amount is required';
      if (!worker) validationErrors.worker = 'Worker is required';
      //if (!worker) validationErrors.worker = 'Worker is required';
      if (!transportFee) validationErrors.transportFee = 'Transport Fee is required';
      if (!vehicle) validationErrors.vehicle = 'Worker is vehicle';
      // Check if there are any validation errors
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join('\n');
        Alert.alert('Validation Error', errorMessage);
        return;
      }

      // Clear any existing errors
      setErrors({});

      const taskData = {
        Worker: worker,
        name,
        date: date ? Timestamp.fromDate(date) : null,
        time,
        location,
        amount,
        vehicle: vehicle ? [vehicle] : [],
        transportFee,
      };

      if (editingTaskId) {
        // If we're in editing mode, update the task
        await updateDoc(doc(db, 'users', editingTaskId), taskData);

        // Exit editing mode after update
        setEditingTaskId(null);
      } else {
        // Otherwise, add a new task
        await addDoc(collection(db, 'users'), taskData);
      }

      // Clear input fields
      resetFields();
    } catch (e) {
      console.error('Error adding or updating task: ', e);
    }
  };


  const handleDeleteWorker = async (workerName: string | undefined) => {
    if (!workerName) return;

    try {
      // Find the worker by name (without domain)
      const workerToDelete = tasks.find((task) => {
       
        const taskWorkerName =
          task.Worker;
        return taskWorkerName === workerName;
      });

      if (!workerToDelete) {
        console.warn(`Worker not found: ${workerName}`);
        return;
      }

      // Delete all tasks associated with the worker
      const tasksToDelete = tasks.filter((task) => task.Worker === workerToDelete.Worker);
      const taskDeletionPromises = tasksToDelete.map((task) => deleteDoc(doc(db, 'users', task.id)));
      await Promise.all(taskDeletionPromises);

      // Delete the worker
      await deleteDoc(doc(db, 'users', workerToDelete.id));



      // Refresh the data after deletion
      const updatedTasks = tasks.filter((task) => task.Worker !== workerToDelete.Worker);
      setTasks(updatedTasks);



    } catch (error) {
      console.error('Error deleting worker: ', error);
      // Handle error as needed
    }
  };


  const deleteUser = async (email: string | undefined) => {
    if(!email) {
      return; 
    }

    try {
     
      const q = query(collection(db, "users"), where("email", "==", email));
  
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {  
         await deleteDoc(querySnapshot.docs[0].ref); 
         console.log('User deleted successfully');
      } else {
         console.log('No user found with that email');
      }

    } catch (error) {
      console.log(error);  
    }
  }

  const showDeleteConfirmation = (workerEma: string | undefined) => {
    if (!workerEma) return;

    // Extract the worker's name from the email (if needed)
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete  ${workerEma}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteWorker(workerEma),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {

    setShowDatePicker(false);

    if (selectedDate) {
      setDate(selectedDate);
    } else {
      setDate(null);
    }

  };


  const handleSelectWorker = (worker: any) => {
    setWorker(worker);
    setIsWorkerMenuVisible(false)
  }




  return (
    <View style={styles.container}>


      {!isEditing && (
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchInput}
          value={searchInput}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          iconColor="#007bff" // Blue color for the icon
          theme={{ colors: { primary: "#007bff" } }} // Blue color for the underline
        />
      )}

      {isEditing ? (
        <>
          <View style={styles.container}>

            <Menu
              visible={isWorkerMenuVisible}
              onDismiss={() => setIsWorkerMenuVisible(false)}
              anchor={
                <Button onPress={() => setIsWorkerMenuVisible(true)}>
                  {worker ? worker : 'Select Worker'}
                </Button>
              }
            >
              {tasks.map(task => {
                
                const workerEm =
                   task.Worker;

                if (workerEm && !uniqueWorkers.has(workerEm)) {
                  uniqueWorkers.add(workerEm);
                  return (
                    <Menu.Item
                      key={workerEm}
                      title={workerEm}
                      onPress={() => handleSelectWorker(workerEm)}
                    />
                  );
                }
                return null;
              })}
            </Menu>

            <TextInput
              mode="outlined"
              style={styles.input}
              value={date ? formatDate(date) : ''}
              label="Date"

              onFocus={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}


            <TextInput
              mode="outlined"
              style={styles.input}
              value={name}
              onChangeText={setName}
              label="Name"

            />

            <TextInput
              mode="outlined"
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              label="Amount"

            />

            <TextInput
              mode="outlined"
              style={styles.input}
              value={time}
              onChangeText={setTime}
              label="Hours"

            />


            <TextInput
              mode="outlined"
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              label="Site"

            />

            



            <TextInput
              mode="outlined"
              style={styles.input}
              value={transportFee}
              onChangeText={setTransportFee}
              label="Transport Fee"
              error={!!errors.transportFee}
            />



            <RadioButton.Group
              onValueChange={(newValue: string) => setVehicle(newValue)}
              value={vehicle}
            >
              <View style={styles.radioButtonContainer}>
                <Text>New</Text>
                <RadioButton value="new" />
              </View>
              <View style={styles.radioButtonContainer}>
                <Text>Old</Text>
                <RadioButton value="Old" />
              </View>
              <View style={styles.radioButtonContainer}>
                <Text>Hitachi</Text>
                <RadioButton value="Hitachi" />
              </View>

            </RadioButton.Group>


            <Button mode="contained"

              onPress={addOrUpdateTask}>
              {editingTaskId ? 'Update' : 'Add'}
            </Button>

            <Button
              mode="text"

              onPress={() => {
                resetFields();
                setIsEditing(false);
                setErrors({});
                //setLoading(false);
              }}
            >
              Go Back
            </Button>


          </View>
        </>
      ) : !loading ? (
        <FlatList
            data={tasks.filter((task) =>
              task.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
              task.location?.toLowerCase().includes(searchInput.toLowerCase())
            )}
            renderItem={({ item }) => {
              
              const workerEma =
                 item.Worker
                  

              if (workerEma && !uniqueWorkers.has(workerEma)) {
                uniqueWorkers.add(workerEma);
                return (
                  <Card style={styles.card}>
                    <List.Item
                      title={workerEma}
                      onPress={() => {
                        navigation.navigate('WorkerTasks', {
                          worker: item.Worker,
                        });
                      }}
                      right={() => (
                        <IconButton
                          icon="delete"
                          onPress={() => showDeleteConfirmation(workerEma)}
                        />
                      )}
                      // left={() => (
                      //   <IconButton
                      //     icon="contact"
                      //     onPress={() => deleteUser(item.Worker)}
                      //   />
                      // )}
                    />
                  </Card>
                );
              }
              return null;
            }}
            keyExtractor={(item) => item.id}
          />
      ) : (
        <> 
          <ActivityIndicator style={styles.loadingIndicator} size="large" color="#007bff" />
        </>
      )}







      {!isEditing && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            setIsEditing(true);
          }}
        />
      )}
    </View>
  );
};

const formatDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // similar to Bootstrap's background
  },
  input: {
    height: 25,
    borderColor: '#ced4da', // similar to Bootstrap's input border
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 4, // similar to Bootstrap's border-radius
    backgroundColor: 'white',
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ced4da',
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  taskText: {
    flex: 1,
    paddingRight: 10,
  },
  button: {
    marginVertical: 10,
    backgroundColor: '#007bff', // Bootstrap primary button color
    borderRadius: 4,
    marginTop: 16, // Add margin to create a gap
  },

  taskHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  collapsibleContent: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ced4da',
  },

  searchInput: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 15,
    elevation: 4, // For a slight shadow
  },
  searchBarInput: {
    fontSize: 16,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },

});

export default Home;
// function getUserByEmail(auth: Auth, email: string) {
//   throw new Error('Function not implemented.');
//  }


