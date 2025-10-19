import { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert} from "react-native";
import { StyleSheet, SafeAreaView, Platform, StatusBar}  from "react-native";
import { FlatList, Pressable, ScrollView, TextInput } from "react-native-gesture-handler";
import CustomButton from "../components/customButton";
import { Modal } from "react-native";
import firestore, { addDoc, collection, deleteDoc, getDocs, limit, orderBy, query, startAfter, doc, updateDoc, onSnapshot, serverTimestamp, Timestamp} from "firebase/firestore"
import { launchImageLibrary } from "react-native-image-picker";
import { Picker } from '@react-native-picker/picker';
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

import { db } from "../services/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";










export default function ExpensesTransaction() {  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null); 

  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    date: "",
    expensesname: "",
    amount: "",
    remarks: "",
  });

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);
  const handleWebDateChange = (event) => {
  const selectedDate = event.target.value; // always in YYYY-MM-DD format
  console.log("Selected date:", selectedDate);

  setFormData((prev) => ({
    ...prev,
    date: selectedDate,
  }));
};

     // --- Real-time listener
   useEffect(() => {
     const q = query(collection(db, "expensestransaction"), orderBy("createdAt", "asc"));
 
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const expensestran = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
       }));
       setItems(expensestran);
     });
 
     return () => unsubscribe();
   }, []);
 
   // --- Filter + paginate
   const filteredItems = searchQuery
     ? items.filter(item =>
         item.expensesname?.toLowerCase().includes(searchQuery.toLowerCase())
       )
     : items;
 
   const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
 
   const pageItems = filteredItems.slice(
     (currentPage - 1) * PAGE_SIZE,
     currentPage * PAGE_SIZE
   );
 
   // --- Pagination handlers
   const goToNextPage = () => {
     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
   };
 
   const goToPreviousPage = () => {
     if (currentPage > 1) setCurrentPage(currentPage - 1);
   };
  // --- Render customer card ---
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* Info */}
      <View style={styles.infoBlock}>
        <Text style={styles.username}>{item.fullName}</Text>
        {item.date ? (
        <Text style={styles.staffInfo}>
            📧 {item.date.toDate ? item.date.toDate().toDateString() : item.date}
        </Text>
        ) : null}
        {item.amount ? <Text style={styles.staffInfo}>📞 {item.amount}</Text> : null}
        {item.expensesname ? <Text style={styles.staffInfo}>📞 {item.expensesname}</Text> : null}
        {item.remarks ? <Text style={styles.staffInfo}>📝 {item.remarks}</Text> : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setIsEditMode(true);
            setCurrentStaffId(item.id);
            setFormData({
              expensesname: item.expensesname || "",
              mobile: item.mobile || "",
              amount: item.amount || "",
              remarks: item.remarks || "",
              date: item.date
  ? item.date.toDate().toISOString().split("T")[0] // convert to JS Date first
  : ""
            });
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setStaffToDelete(item);
            setDeleteModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );



    const handleSubmit = async () => {
      try {
        if (!formData.expensesname) {
          alert("Please fill the required fields");
          return;
        }

        setModalVisible(false);
        setIsEditMode(false);
        setCurrentStaffId(null);

        if (isEditMode && currentStaffId) {
          // UPDATE staff
          await updateDoc(doc(db, "expensestransaction", currentStaffId), {
            expensesname: formData.expensesname,
            amount: formData.amount,
            remarks: formData.remarks,
            date: formData.date,
            createdAt: serverTimestamp()
          });


           setItems(prevItems =>
            prevItems.map(item =>
              item.id === currentStaffId ? { ...item, ...formData } : item
            )
          );
        } else {
          // ADD staff
          await addDoc(collection(db, "expensestransaction"), {
            expensesname: formData.expensesname,
            amount: formData.amount,
            remarks: formData.remarks,
            date: formData.date,
            createdAt: serverTimestamp()
          });

        }

        // Reset form
        setFormData({
          expensesname: "",
          amount: "",
          remarks: "",
          date: "",

        });

      } catch (error) {
        console.error('Error saving data', error);
        alert("Saving data failed");
      }
    };

    // Function to delete in Firestore
    const handleConfirmDelete = async () => {
      if (!staffToDelete) return;

      try {
        await deleteDoc(doc(db, "expensestransaction", staffToDelete.id)); // make sure your Firestore collection is "staff"

         // Remove from local state immediately
        setItems(prevItems => prevItems.filter(i => i.id !== staffToDelete.id));
        console.log("Transaction deleted successfully");
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setDeleteModalVisible(false);
        setStaffToDelete(null);
      }
    };


    return (
        <SafeAreaView style={styles.container}>

            {loggedInUser && (
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                Logged in as:{" "}
                <Text style={{ fontWeight: "bold" }}>{loggedInUser.username}</Text>{" "}
                ({loggedInUser.role})
              </Text>
            )}
            <Text style={styles.screenTitle}>Expenses Transactions</Text>


            <View style={styles.searchAndAdd}>
                <View style={styles.searchWrapper}>
                    <TextInput 
                    style={styles.staffinput}
                    placeholder="Search...."
                    value={searchQuery}
                    onChangeText={text => setSearchQuery(text)}
                    />
                </View>


                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setIsEditMode(false); // switch to add mode
                      setCurrentStaffId(null); // clear any staff id
                      setFormData({
                        expensesname: "",
                        amount: "",
                        remarks: "",
                        date: "",
                      }); // reset form
                      setModalVisible(true); // open modal
                    }}
                  >
  <Text style={styles.buttonText}>Add Transaction</Text>
</TouchableOpacity>
            </View>


            <FlatList
                  data={
                    searchQuery
                      ? pageItems.filter(item => 
                          item.expensesname?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      : pageItems
                  }
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                />

                {/* Pagination Controls */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                  <TouchableOpacity disabled={currentPage === 1} onPress={goToPreviousPage}>
                    <Text style={{ color: currentPage === 1 ? "gray" : "blue" }}>← Prev</Text>
                  </TouchableOpacity>

                  <Text>Page {currentPage}</Text>

                  <TouchableOpacity disabled={!hasMore} onPress={goToNextPage}>
                    <Text style={{ color: !hasMore ? "gray" : "blue" }}>Next →</Text>
                  </TouchableOpacity>
                </View>


            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{alignSelf:"flex-end"}}>X</Text></TouchableOpacity>
                            <Text style={{fontSize: 28, fontWeight:"bold", color:"blue"}}>
                              {isEditMode ? "Edit Transaction" : "Add Transaction"}
                            </Text>


                            <Text style={{fontSize:14, fontWeight:"bold"}}>Date Since:</Text>
                            {Platform.OS === 'web' ? (
                              <input
                                type="date"
                                value={formData.date || ""} // use state here
                                onChange={handleWebDateChange}
                                style={{
                                  padding: 12,
                                  marginBottom: 10,
                                  borderRadius: 8,
                                  border: "1px solid #ccc",
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            ) : (
                              <TouchableOpacity
                                onPress={() => setShowPicker(true)}
                                style={{
                                  padding: 12,
                                  marginBottom: 10,
                                  borderWidth: 1,
                                  borderColor: '#ccc',
                                  borderRadius: 8,
                                }}
                              >
                                <Text style={{ color: formData.date ? '#000' : '#888' }}>
                                  {formData.date
                                    ? formData.date.toDate().toISOString().split("T")[0] // convert to JS Date first
                                    : ""}
                                </Text>
                              </TouchableOpacity>
                            )}

                
                            <TextInput placeholder="Expense Name *" placeholderTextColor="#888" value={formData.expensesname} onChangeText={text => setFormData({...formData, expensesname: text})} style={styles.stafffields}/>
                            <TextInput placeholder="Amount" placeholderTextColor="#888" value={formData.amount} onChangeText={text => setFormData({...formData, amount: text})} style={styles.stafffields}></TextInput>
                            <TextInput placeholder="Remarks" placeholderTextColor="#888" value={formData.remarks} onChangeText={text => setFormData({...formData, remarks:text})} style={styles.stafffields}></TextInput>
                            

                            <View style={{marginTop:20}}>
                                <TouchableOpacity style={styles.submitAddStaff} onPress={handleSubmit}>
                                    <Text style={{color:"#fff", fontWeight:"bold"}}>{isEditMode ? "Update" : "Submit"}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
                
            </Modal>



            <Modal
              transparent={true}
              visible={isDeleteModalVisible}
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={{ fontSize: 16, marginBottom: 20 }}>
                    Are you sure you want to delete {staffToDelete?.expensesname}?
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "red" }]}
                      onPress={handleConfirmDelete}
                    >
                      <Text style={{ color: "#fff" }}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "gray" }]}
                      onPress={() => setDeleteModalVisible(false)}
                    >
                      <Text style={{ color: "#fff" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

        </SafeAreaView>
    )
}
 
const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "lightblue",
        paddingTop:60,
        paddingLeft: 20,
    },
     modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  submitAddStaff:{
    borderWidth:1,
    borderColor:"blue",
    backgroundColor:"blue",
    textAlign: "center",
    padding:12,
    borderRadius:20,
    alignItems:"center",
   
    

  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightblue',
    width: '80%',
    maxWidth: 800,
    maxHeight:800
  },

    staffInfo:{
        borderRightWidth:1,
        borderRightColor:"black",
        paddingRight:10,
        paddingLeft:10,
        marginTop: 10
    },
    button:{
        backgroundColor:'#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },

    staffDetail:{
        fontSize: 20,
        fontWeight:"bold",

    },

    buttonText:{
        color:'#fff',
        fontWeight:'bold'
    },

    searchWrapper:{
        flex: 1,
        marginRight: 10,
    },

    addStaffButton:{
        borderRadius: 10,
        backgroundColor: 'white',
        width: 80,
        alignItems:'center',
        justifyContent: 'center'
    },





    searchAndAdd:{
        flexDirection:'row',
        maxWidth: 800,
        marginBottom: 10,
    },


    screenTitle:{
        fontWeight:'bold',
        fontSize:30,
        paddingBottom: 10
    },
    staffinput:{
        borderBottomWidth: 1,
        backgroundColor:"#fff",
        height: 50,
        borderRadius:10,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // Android shadow
        fontSize: 16,
        width:'100%',
        padding: 8

    },

    card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 5,
    width: '95%',
 
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  infoBlock: {
    flex: 1,
    flexDirection: 'column',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  inlineInfo: {
    flexDirection: 'block',
    flexWrap: 'wrap',
  },
  staffInfo: {
    marginRight: 10,
    paddingRight: 10,

    fontSize: 14,
  },
  buttonContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    gap: 5,
    flexDirection:"row"
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 70,
    alignItems:"center"
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 70,
    alignItems: "center"
  },

  stafffields:{
    borderWidth: 1,
    borderColor:"lightblue",
    padding: 12,
    marginBottom: 10,

  },


  //THIS IS FOR THE DELETE MODAL:

 modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalBox: {
  width: 300,
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 10,
},
modalButton: {
  padding: 10,
  borderRadius: 5,
  minWidth: 100,
  alignItems: "center",
},



//THIS IS FOR THE DATE PICKER:

dateInput: {
  borderWidth: 1,
  borderColor: "lightblue",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  justifyContent: "center",
},
})