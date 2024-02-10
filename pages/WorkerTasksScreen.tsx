import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,


} from 'firebase/firestore';
import app from '../firebase/firebaseConfig';
import { RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/routers';
import { Card, List, Button, Searchbar, TextInput, RadioButton, Menu } from 'react-native-paper'; // Import Searchbar and FAB
import { Share } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';




interface WorkerTasksScreenProps {
  route: RouteProp<ParamListBase, 'WorkerTasks'>;
}

interface Task {
  transportFee: string;
  amount: string;
  time: string;
  vehicle: string[];
  location: string;
  date: any;
  id: string;
  name: string;
  // Add other properties as needed
}



const WorkerTasksScreen: React.FC<WorkerTasksScreenProps> = ({ route }) => {
  const { worker } = route.params as { worker: string };
  const [workerTasks, setWorkerTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false); // New state for edit mode
  const [editFormData, setEditFormData] = useState<Task | null>({
    name: '',
    transportFee: '',
    amount: '',
    time: '',
    location: '',
    vehicle: [],
    date: null as Date | null,
    id: '',
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>('All');
  const months = [

    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isYearMenuVisible, setIsYearMenuVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const startYear = 2023; // Set your desired start year

  const years = Array.from({ length: currentYear - startYear + 1 }, (_, index) => startYear + index);
  const [showDatePicker, setShowDatePicker] = useState(false);



  useEffect(() => {
    const fetchTasks = async () => {
      const db = getFirestore(app);
      const q = query(collection(db, 'users'), where('Worker', '==', worker));

      try {
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Task;

          // Check if 'date' field exists and has 'toDate' method before calling it
          const date = data.date && data.date.toDate ? data.date.toDate() : null;

          // Log the problematic data for debugging
          if (!date && data.date !== null) {
            console.error('Invalid date field in task:', data.date, 'Task ID:', doc.id);
          }

          return { ...data, id: doc.id, date };
        });

        setWorkerTasks(tasks);
      } catch (error) {
        console.error('Error fetching worker tasks: ', error);
      }
    };


    fetchTasks();
  }, [worker]);

  const toggleTask = (id: string) => {
    setExpandedTaskId((prevId) => (prevId === id ? null : id));
  };

  const deleteTask = async (id: string) => {
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'users', id));
    // Refresh the task list after deletion
    const updatedTasks = workerTasks.filter((task) => task.id !== id);
    setWorkerTasks(updatedTasks);
  };


  const startEditing = (task: Task) => {
    setIsEditing(true);
    setEditFormData(task);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFormData(null);
  };

  const updateTask = async () => {
    if (editFormData) {
      const db = getFirestore(app);
      const taskRef = doc(db, 'users', editFormData.id);
      if (validateFormData(editFormData)) {
        // Cast editFormData to { [x: string]: any } to satisfy TypeScript
        await updateDoc(taskRef, editFormData as { [x: string]: any });
        const updatedTasks = workerTasks.map((task) => (task.id === editFormData.id ? editFormData : task));
        setWorkerTasks(updatedTasks);
        setIsEditing(false);
        setEditFormData(null);
      } else {
        // Handle validation error
        // You may want to show an error message or take other actions
      }
    }
  };

  const shareTask = async (item: Task) => {
    const invoice = `
    MaxxPro

    Name: ${item.name}
    Amount: ${item.amount}
    Hours: ${item.time}
    Location: ${item.location}
    Date: ${formatDate(item.date)}
    Transport Fee: ${item.transportFee}
    `;

    try {
      const result = await Share.share({
        message: invoice,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };



  const calculateTotalAmount = (): string => {
    const totalAmount = filteredTasks.reduce((sum, task) => sum + parseFloat(task.amount), 0);
    return totalAmount.toFixed(0); // Format the total amount to display two decimal places
  };

  const calculateTotalTime = (): string => {
    const totalTime = filteredTasks.reduce((sum, task) => sum + parseFloat(task.time), 0);
    return totalTime.toFixed(0); // Format the total time to display two decimal places
  };


  const validateFormData = (editFormData: Task) => {
    // Implement your validation logic here
    // Return true if the data is valid, false otherwise
    return true;
  };

  const handleMonthChange = (month: string | null) => {
    setSelectedMonth(month);
    setIsMenuVisible(false);
  };

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    setIsYearMenuVisible(false);
  };




  const isSameMonth = (date: Date, selectedMonth: string | null): boolean => {
    if (!selectedMonth || selectedMonth === 'All') {
      return true; // Return true for all tasks when 'All' is selected or selectedMonth is null
    }

    if (selectedMonth === 'CurrentDay') {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }

    return date.getMonth() + 1 === months.indexOf(selectedMonth) + 1;
  };

  const isSameYear = (date: Date, selectedYear: number | null): boolean => {
    if (selectedYear === null) {
      return true; // Return true for all tasks when 'All' is selected or selectedYear is null
    }

    return date.getFullYear() === selectedYear;
  };


  const filteredTasks = workerTasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      task.vehicle?.some((vehicleType) =>
        vehicleType.toLowerCase().includes(searchInput.toLowerCase())
      ) ||
      task.location?.toLowerCase().includes(searchInput.toLowerCase()) ||
      (task.date && formatDate(task.date).includes(searchInput.toLowerCase()));
    // ||
    // (task.date && getDayFromDate(task.date) === parseInt(searchInput, 10));

    const matchesMonth = isSameMonth(task.date, selectedMonth);
    const matchesYear = isSameYear(task.date, selectedYear);

    return matchesSearch && matchesMonth && matchesYear;
  
   });
;

const sortedTasks = filteredTasks.sort((a, b) => {
  if (a.date && b.date) {
    return b.date.getTime() - a.date.getTime();
  } else {
    return 0;
  }
});


  return (
    <View style={styles.container}>
      {!isEditing && <>
        <View style={styles.filterContainer}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchInput}
            value={searchInput}
            style={styles.searchBar}
            iconColor="#007bff"
            theme={{ colors: { primary: "#007bff" } }}
          />
          <View style={styles.filterButtonContainer}>
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
          </View>

          <View style={styles.monthPickerContainer}>
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
          </View>

          <View style={styles.totalSection}>
            <Text> Amount: {calculateTotalAmount()}</Text>
            <Text> Time: {calculateTotalTime()} </Text>
          </View>
        </View>

      </>}


      {isEditing ? (
        // Render your edit form here
        <View style={styles.editForm}>
          {/* Add TextInput components for each field in your task */}


          <TextInput
            label="Name"
            value={editFormData?.name || ''}
            onChangeText={(text) => setEditFormData(prevState => {
              if (prevState) {
                return {
                  ...prevState,
                  name: text
                } as Task;
              }

              return prevState;
            })}
          />

          <TextInput

            value={editFormData?.date?.toDateString() || ''}
            label="Date"

            onFocus={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={editFormData?.date || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                if (date) {
                  
                  setShowDatePicker(false);
                  setEditFormData(prevState => {
                    if (prevState) {
                      return {
                        ...prevState,
                        date
                      } as Task;

                    }
                    ;
                    return prevState;
                  });
                }
              }}
            />

          )}
          <TextInput
            label="Amount"
            value={editFormData?.amount || ''}
            onChangeText={(text) => setEditFormData(prevState => {
              if (prevState) {
                return {
                  ...prevState,
                  amount: text
                } as Task;
              }

              return prevState;
            })}
          />
          <TextInput
            label="Hours"
            value={editFormData?.time || ''}
            onChangeText={(text) => setEditFormData(prevState => {
              if (prevState) {
                return {
                  ...prevState,
                  time: text
                } as Task;
              }

              return prevState;
            })}
          />
          <TextInput
            label="Site"
            value={editFormData?.location || ''}
            onChangeText={(text) => setEditFormData(prevState => {
              if (prevState) {
                return {
                  ...prevState,
                  location: text
                } as Task;
              }

              return prevState;
            })}
          />
          <TextInput
            label="Transport Fee"
            value={editFormData?.transportFee || ''}
            onChangeText={(text) => setEditFormData(prevState => {
              if (prevState) {
                return {
                  ...prevState,
                  transportFee: text
                } as Task;
              }

              return prevState;
            })}
          />


          <RadioButton.Group
            onValueChange={(newValue) =>
              setEditFormData(prevState => {
                if (prevState) {
                  return {
                    ...prevState,
                    vehicle: [newValue]
                  } as Task;
                }

                return prevState;
              })}
            value={editFormData?.vehicle?.[0] || ''}
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



          {/* Add other TextInput components for each field */}
          <View style={styles.buttonGroup}>
            <Button mode="contained" onPress={updateTask} style={styles.updateButton}>
              Update
            </Button>
            <Button mode="outlined" onPress={cancelEditing} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <TouchableOpacity onPress={() => toggleTask(item.id)}>
                <List.Item title={item.name}
                  description={item.location} />

              </TouchableOpacity>

              {expandedTaskId === item.id && (
                <Card.Content>
                  <Text style={{ fontStyle: 'italic' }}>Amount: {item.amount}</Text>
                  <Text style={{ fontStyle: 'italic' }}>
                    {item.date ? formatDate(item.date) : 'No date set'}
                  </Text>

                  {/* Check if 'item.date' exists before using 'toDate' method */}
                  <Text style={{ fontStyle: 'italic' }}>Hours: {item.time}</Text>

                  <Text style={{ fontStyle: 'italic' }}>Vehicle: {item.vehicle?.join(', ') || 'None'}</Text>

                  <Text style={{ fontStyle: 'italic' }}>Trans Fee: {item.transportFee}</Text>

                  <View style={styles.buttonContainer}>



                    <Button mode="contained" onPress={() => startEditing(item)}>
                      Edit
                    </Button>
                    <Button mode="contained" onPress={() => shareTask(item)}>
                      Share
                    </Button>
                    <Button mode="outlined" color="#ff5c5c" onPress={() => deleteTask(item.id)}>
                      X
                    </Button>
                  </View>
                </Card.Content>
              )}
            </Card>
          )}
          keyExtractor={(item) => item.id}
        />
      )}



    </View>
  );
};

const formatDate = (date: Date | null): string => {
  if (!date) {
    return "Invalid date"; // Or handle as needed
  }

  const isValidDate = !isNaN(date.getTime()); // Check if the date is valid
  if (!isValidDate) {
    console.error('Invalid date:', date);
    return "Invalid date"; // Or handle as needed
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  searchBar: {
    marginBottom: 15,
    elevation: 4, // For a slight shadow
  },
  editForm: {
    // Add styles for your edit form
    padding: 20,
    backgroundColor: '#fff',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // This will space the radio buttons equally across the horizontal axis
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16, // Adjust the margin as needed
  },
  updateButton: {
    flex: 1, // Take up available space
    marginRight: 8, // Adjust the margin between buttons
  },
  cancelButton: {
    flex: 1, // Take up available space
    marginLeft: 8, // Adjust the margin between buttons
  },

  totalSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default WorkerTasksScreen;


