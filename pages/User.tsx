import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import app from '../firebase/firebaseConfig';
import { getFirestore, collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
//import { getAuth } from 'firebase/auth';
import { FAB, Searchbar, TextInput, Button, RadioButton, Text, List, Card, Menu } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';


const db = getFirestore(app);
//const auth = getAuth();

const User: React.FC<{ navigation: any , route: any }> = ({ navigation, route }) => {
  const workerEmail = route.params?.worker || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [vehicle, setVehicle] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [originalDate, setOriginalDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  // const months = [

  //   'January',
  //   'February',
  //   'March',
  //   'April',
  //   'May',
  //   'June',
  //   'July',
  //   'August',
  //   'September',
  //   'October',
  //   'November',
  //   'December'
  // ];
  //const [isMenuVisible, setIsMenuVisible] = useState(false);
  // const [isYearMenuVisible, setIsYearMenuVisible] = useState(false);
  //const currentYear = new Date().getFullYear();
  // const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  //const startYear = 2023; // Set your desired start year

  //const years = Array.from({ length: currentYear - startYear + 1 }, (_, index) => startYear + index);


  useEffect(() => {
    if (workerEmail) {
      const q = query(
        collection(db, "users"),
        where("Worker", "==", workerEmail)  // This line filters the tasks
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }
  }, [navigation, setIsEditing]);

  


  type Task = {
    // [x: string]: any;
    id: string;
    name?: string;
    date?: any;//
    Worker?: string;
    time?: string;
    vehicle?: string[];
    amount?: string;
    location?: string;

  };

  const resetFields = () => {
    setName('');
    setDate(null);
    setTime('');
    setLocation('');
    setAmount('');
    setVehicle('');

  };


  const editTask = (task: Task) => {

    setName(task.name || '');
    setAmount(task.amount || '');
    setTime(task.time || '');
    setLocation(task.location || '');
    if (task.vehicle?.includes('New')) {
      setVehicle('New');
    } else if (task.vehicle?.includes('Old')) {
      setVehicle('Old');

    } else {
      setVehicle(''); // or some default if necessary
    }

    setEditingTaskId(task.id);
    setOriginalDate(task.date ? task.date : null);
  };


  const addOrUpdateTask = async () => {
    try {

      const validationErrors: Record<string, string> = {};
      if (!name) validationErrors.name = 'Name is required';
      if (!date) validationErrors.date = 'Date is required';
      if (!time) validationErrors.time = 'Time is required';
      if (!location) validationErrors.location = 'Location is required';
      if (!amount) validationErrors.amount = 'Amount is required';

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
        Worker: workerEmail,
        name,
        date: date || originalDate,//null as Date | null
        time,
        amount,
        location,
        vehicle: vehicle ? [vehicle] : [],

      };

      if (editingTaskId) {
        // If we're in editing mode, update the task
        await updateDoc(doc(db, "users", editingTaskId), taskData);

        // Exit editing mode after update
        setEditingTaskId(null);
      } else {
        // Otherwise, add a new task
        await addDoc(collection(db, "users"), taskData);
      }

      // Clear input fields

      resetFields();
      setOriginalDate(null);

    } catch (e) {
      console.error("Error adding or updating task: ", e);
    }
  };


  const removeTask = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  };

  const toggleTask = (id: string) => {
    if (expandedTaskId === id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(id);
    }
  };

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setDate(selectedDate);
    } else {
      setDate(null);
    }
  };


  // const handleMonthChange = (month: string | null) => {
  //   setSelectedMonth(month);
  //   setIsMenuVisible(false);
  // };

  // const handleYearChange = (year: number | null) => {
  //   setSelectedYear(year);
  //   setIsYearMenuVisible(false);
  // };

  // const isSameMonth = (date: Date, selectedMonth: string | null): boolean => {

  //   console.log( date+"1")
  //   if (!selectedMonth || selectedMonth === 'All') {
  //     return true; // Return true for all tasks when 'All' is selected or selectedMonth is null
  //   }

  //   if (selectedMonth === 'CurrentDay') {
  //     const today = new Date();
  //     return date.getDate() === today.getDate() &&
  //       date.getMonth() === today.getMonth() &&
  //       date.getFullYear() === today.getFullYear();
  //   }

  //   return date.getMonth() + 1 === months.indexOf(selectedMonth) + 1;
  // };



  // const isSameYear = (date: Date, selectedYear: number | null): boolean => {
  //   console.log( date+"2")
  //   if (selectedYear === null) {
  //     return true; // Return true for all tasks when 'All' is selected or selectedYear is null
  //   }

  //   return date.getFullYear() === selectedYear;
  // };


  // const filteredTasks = tasks.filter((task) => {
  //   console.log( task.date+"3")

  //   const matchesSearch =
  //     task.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
  //     task.vehicle?.some((vehicleType) =>
  //       vehicleType.toLowerCase().includes(searchInput.toLowerCase())
  //     ) ||
  //     task.location?.toLowerCase().includes(searchInput.toLowerCase()) ||
  //     (task.date && formatDate(task.date).includes(searchInput.toLowerCase())); // Cast to Date


  //   const matchesMonth = isSameMonth(task.date, selectedMonth); // Cast to Date
  //   const matchesYear = isSameYear(task.date, selectedYear); // Cast to Date

  //   return matchesSearch && matchesMonth && matchesYear;
  // });

  const filteredTasks = tasks.filter(task =>
    task.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    task.vehicle?.some(vehicleType => vehicleType.toLowerCase().includes(searchInput.toLowerCase())) ||
    task.location?.toLowerCase().includes(searchInput.toLowerCase()) ||
    (task.date && formatDate(task.date).includes(searchInput.toLowerCase()))
    
  ).sort((a:any, b:any) => {
    // Sort by date in descending order
    return b.date?.toDate().getTime() - a.date?.toDate().getTime();
  });



  return (
    <View style={styles.container}>


      {!isEditing && (<>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchInput}
          value={searchInput}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          iconColor="#007bff" // Blue color for the icon
          theme={{ colors: { primary: "#007bff" } }} // Blue color for the underline
        />
        {/* <View style={styles.filterButtonContainer}>
          <Menu
            visible={isMenuVisible}
            onDismiss={() => setIsMenuVisible(false)}
            anchor={
              <Button
                icon="filter"
                onPress={() => setIsMenuVisible(!isMenuVisible)}
              >
                {selectedMonth === 'CurrentDay' ? 'Current Day' : selectedMonth || 'Select month'}
              </Button>
            }
          >
            <Menu.Item title="All" onPress={() => handleMonthChange('All')} />
            <Menu.Item title="Current Day" onPress={() => handleMonthChange('CurrentDay')} />
            {months.map((month) => (
              <Menu.Item
                key={month}
                title={month}
                onPress={() => handleMonthChange(month.toString())}
              />
            ))}
          </Menu>
        </View> */}

        {/* <View style={styles.monthPickerContainer}>
          <Menu
            visible={isYearMenuVisible}
            onDismiss={() => setIsYearMenuVisible(false)}
            anchor={
              <Button
                icon="filter"
                onPress={() => setIsYearMenuVisible(!isYearMenuVisible)}
              >
                {selectedYear ? selectedYear.toString() : 'Select year'}
              </Button>
            }
          >
            <Menu.Item title="All" onPress={() => handleYearChange(null)} />
            {years.map((year) => (
              <Menu.Item
                key={year}
                title={year.toString()}
                onPress={() => handleYearChange(year)}
              />
            ))}
          </Menu>
        </View> */}
      </>
      )}


      {isEditing ? (
        <>
          <View style={styles.container}>

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
              value={time}
              onChangeText={setTime}
              label="Hours"
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
              value={location}
              onChangeText={setLocation}
              label="Site"
            />




            <RadioButton.Group
              onValueChange={(newValue: string) => setVehicle(newValue)}
              value={vehicle}
            >
              <View style={styles.radioButtonContainer}>
                <Text>New</Text>
                <RadioButton value="New" />
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


            <View style={styles.buttonContainer2}>
              <Button mode="contained" onPress={addOrUpdateTask}>
                {editingTaskId ? "Update" : "Add"}
              </Button>
              <Button mode="text" onPress={() => {
                setIsEditing(false);
                resetFields();
                setEditingTaskId(null);
                setOriginalDate(null);
              }}>
                Go Back
              </Button>
            </View>

          </View>
        </>
      ) : (
        <>

          <FlatList
            data={filteredTasks}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <List.Item
                  title={item.name}
                  description={item.location}
                  // left={() => <List.Icon icon="folder" />}
                  onPress={() => toggleTask(item.id)}
                />

                {expandedTaskId === item.id && (
                  <Card.Content>
                    <Text style={{ fontStyle: 'italic' }}>
                      {item.date ? formatDate(item.date) : 'No date set'}
                    </Text>
                    <Text style={{ fontStyle: 'italic' }}>Amount: {item.amount}</Text>
                    <Text style={{ fontStyle: 'italic' }}>Hours: {item.time}</Text>
                    <Text style={{ fontStyle: 'italic' }}>Vehicle: {item.vehicle?.join(", ") || 'None'}</Text>


                    {/* <View style={styles.buttonContainer}>
                      <Button mode="contained" onPress={() => {
                        setIsEditing(true);
                        editTask(item);
                      }}>
                        Edit
                      </Button>
                      <Button mode="outlined" color="#ff5c5c" onPress={() => removeTask(item.id)}>
                        X
                      </Button>
                    </View> */}
                  </Card.Content>
                )}
              </Card>
            )}
            keyExtractor={(item) => item.id}
          />
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
}

const formatDate = (date: Date | Timestamp | null): string => {
  // Check if the date parameter is null
  if (!date) {
    return 'Invalid date';
  }

  // If the date is a Firestore Timestamp, convert it to a Date
  if (date instanceof Timestamp) {
    date = date.toDate();
  }

  // Check if the date parameter is a valid date object
  if (!(date instanceof Date)) {
    return 'Invalid date';
  }

  // Format the date object
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};








const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',  // similar to Bootstrap's background

  },
  input: {
    height: 30,
    borderColor: '#ced4da',  // similar to Bootstrap's input border
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 4,  // similar to Bootstrap's border-radius
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
    backgroundColor: '#007bff',  // Bootstrap primary button color
    borderRadius: 4,
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
    marginBottom: 12
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
    justifyContent: 'space-between',  // This will space the radio buttons equally across the horizontal axis
  },
  buttonContainer2: {
    top: 124,


  },
  monthPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },


});



export default User;
