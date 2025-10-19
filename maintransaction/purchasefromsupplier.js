import { useState } from "react";
import { View, Text, TouchableOpacity} from "react-native";
import { StyleSheet, SafeAreaView, Platform}  from "react-native";
import { FlatList, Pressable, ScrollView, TextInput } from "react-native-gesture-handler";
import { Modal } from "react-native";
import firestore, { addDoc, collection, deleteDoc, limit, orderBy, query, doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { Picker } from '@react-native-picker/picker';
import { useEffect } from "react";

import { db } from "../services/firebaseConfig";



export default function PurchaseFromSupplier() {  
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [productRows, setProductRows] = useState([]);   // dynamic rows


    const [currentPage, setCurrentPage] = useState(1);


    // Save purchase function
const savePurchase = async () => {
  try {

     // 0. Calculate total from productRows
    const total = productRows.reduce(
      (sum, row) => sum + Number(row.total || 0),
      0
    );
    setModalVisible(false);
    // 1. Add the purchase (parent document)
    const docRef = await addDoc(collection(db, "purchasesupp"), {
      createdAt: serverTimestamp(),
      date: purchaseData.date,
      referenceno: purchaseData.referenceNo,
      supplier: purchaseData.supplier,
      total
    });

    // 2. Add the products (subcollection under the purchase)
    for (let row of productRows) {
      await addDoc(collection(db, "purchasesupp", docRef.id, "products"), {
        productName: row.productName,
        quantity: row.quantity,
        cost: row.cost,
        total: row.total,
      });
    }
  
  } catch (error) {
    console.error("Error saving purchase:", error);
  }
};




  const addProductRow = () => {
    setProductRows((prev) => [
      ...prev,
      { id: Date.now().toString(), productName: "", quantity: "", cost: "", total: "" }
    ]);
  };

  const deleteRow = (id) => {
    setProductRows((prev) => prev.filter((row) => row.id !== id));
  };
   
    // For purchase (parent document)
    const [purchaseData, setPurchaseData] = useState({
      date: '',
      referenceNo: '',
      supplier: '',
    });



    const handleWebDateChange = (event) => {
      const selectedDate = event.target.value; // always in YYYY-MM-DD format
      console.log("Selected date:", selectedDate);

      setPurchaseData((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    };


    // To hold multiple products before saving
    const [products, setProducts] = useState([]);

    const PAGE_SIZE = 10;
   // --- Real-time listener
    useEffect(() => {
      const q = query(collection(db, "purchasesupp"), orderBy("createdAt", "asc"));
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const expenseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(expenseList);
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

    // Real-time suppliers
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "suppliers"),
    (snapshot) => {
      const supplierList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuppliers(supplierList);
    },
    (error) => {
      console.error("Error fetching suppliers:", error);
    }
  );

  return () => unsubscribe(); // cleanup on unmount
}, []);

// Real-time products
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    },
    (error) => {
      console.error("Error fetching products:", error);
    }
  );

  return () => unsubscribe(); // cleanup on unmount
}, []);

    const renderItem = ({ item }) => (
            <View style={styles.card}>
    
                {/* Info Section */}
                <View style={styles.infoBlock}>
                <Text style={styles.username}>{item.date ? new Date(item.date).toLocaleDateString() : "No date"}{" "}</Text>
                <View style={styles.inlineInfo}>
                    {item.referenceno ? <Text style={styles.staffInfo}><Text style={{fontWeight:100}}>Reference no: </Text>{item.referenceno}</Text> : null}
                    {item.supplier ? <Text style={styles.staffInfo}><Text style={{fontWeight:100}}>Supplier: </Text>{item.supplier}</Text> : null}
                    {item.total ? <Text style={styles.staffInfo}><Text style={{fontWeight:100}}>Total: ₱ </Text>{item.total}</Text> : null}
                    
                </View>
                </View>
    
                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton}
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

        // Function to delete in Firestore
    const handleConfirmDelete = () => {
  if (!staffToDelete) return;

  // Close modal immediately to prevent double clicks
  setDeleteModalVisible(false);
  const idToDelete = staffToDelete.id;
  setStaffToDelete(null);

  // Remove from local state immediately
  setItems(prevItems => prevItems.filter(i => i.id !== idToDelete));

  // Delete from Firestore in the background
  deleteDoc(doc(db, "purchasesupp", idToDelete))
    .then(() => {
      console.log("Purchase deleted successfully");
    })
    .catch(error => {
      console.error("Error deleting purchase:", error);
      // Optional: restore the item in local state if deletion fails
      setItems(prevItems => [...prevItems, { id: idToDelete, ...staffToDelete }]);
    });
};


    return (
        <SafeAreaView style={styles.container}>

            <Text style={styles.screenTitle}>Purchases From Supplier</Text>


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
                    style={styles.button}  onPress={()=> setModalVisible(true)}
                  >
                  <Text style={styles.buttonText}>Add Product</Text>
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
                                        <Text style={{fontSize: 28, fontWeight:"bold", color:"blue", marginBottom: 8}}>
                                          Add Purchase
                                        </Text>


                                         {Platform.OS === 'web' ? (
                                          <input
                                            type="date"
                                            value={purchaseData.date}
                                            onChange={handleWebDateChange}
                                            style={{
                                              padding: 12,
                                              marginBottom: 10,
                                              borderRadius: 8,
                                              border: '1px solid #ccc',
                                              width: '100%',
                                              boxSizing: 'border-box',
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
                                            <Text style={{ color: purchaseData.date ? '#000' : '#888' }}>
                                              {purchaseData.date
                                                ? new Date(purchaseData.date).toDateString()
                                                : 'Date *'}
                                            </Text>
                                          </TouchableOpacity>
                                        )}

                                        <TextInput placeholder="Reference No" placeholderTextColor="#888" value={purchaseData.referenceNo} onChangeText={(val) => setPurchaseData((prev) => ({ ...prev, referenceNo: val }))
  }style={styles.stafffields}/>
                                        
                                        <Picker
                                          selectedValue={purchaseData.supplier}
                                          onValueChange={(value) =>
                                            setPurchaseData((prev) => ({ ...prev, supplier: value }))
                                          }
                                          style={{ borderWidth: 1, borderColor: "lightblue", padding: 12, width: "100%" }}
                                        >
                                          <Picker.Item label="Select Supplier" value="" enabled={false} />
                                          {suppliers.map((supplier) => (
                                            <Picker.Item
                                              key={supplier.id}
                                              label={supplier.suppliername}
                                              value={supplier.suppliername}
                                            />
                                          ))}
                                        </Picker>

                                        <Text style={{marginTop:20, fontWeight:"bold", fontSize:18, color:"blue"}}>Product/s</Text>

                                        {/* Dynamic Product Rows */}
                                        {productRows.map((row) => (
                                          <View
                                            key={row.id}
                                            style={{
                                              marginTop: 15,
                                              borderWidth: 1,
                                              borderColor: "lightblue",
                                              padding: 10,
                                              borderRadius: 8,
                                            }}
                                          >
                                            {/* Product Picker */}
                                            <Picker
                                              selectedValue={row.productName}
                                              onValueChange={(value) => {
                                                  const selectedProduct = products.find(
                                                    (p) => p.productname === value
                                                  );

                                                  setProductRows((prev) =>
                                                    prev.map((item) =>
                                                      item.id === row.id
                                                        ? {
                                                            ...item,
                                                            productName: value,
                                                            cost: selectedProduct ? String(selectedProduct.price) : "",
                                                          }
                                                        : item
                                                    )
                                                  );
                                                }}
                                              style={{
                                                borderWidth: 1,
                                                borderColor: "lightblue",
                                                padding: 12,
                                                width: "100%",
                                                marginBottom: 8,
                                              }}
                                          >
                                        <Picker.Item label="Select Product" value="" enabled={false} />
                                          {products.map((product) => (
                                            <Picker.Item
                                              key={product.id}
                                              label={product.productname}
                                              value={product.productname}
                                            />
                                          ))}
                                        </Picker>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <TextInput
                placeholder="Qty"
                keyboardType="numeric"
                value={row.quantity}
                onChangeText={(val) =>
                  setProductRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id
                        ? {
                            ...item,
                            quantity: val,
                            total: Number(val || 0) * Number(item.cost || 0), // Recalculate total
                          }
                        : item
                    )
                  )
                }
                style={{
                  borderWidth: 1,
                  borderColor: "lightblue",
                  flex: 1,
                  marginRight: 5,
                  padding: 8,
                }}
              />

              <TextInput
                placeholder="Cost"
                keyboardType="numeric"
                value={row.cost}
                onChangeText={(val) =>
                  setProductRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id
                        ? {
                            ...item,
                            cost: val,
                            total: Number(item.quantity || 0) * Number(val || 0), // Recalculate total
                          }
                        : item
                    )
                  )
                }
                style={{
                  borderWidth: 1,
                  borderColor: "lightblue",
                  flex: 1,
                  marginRight: 5,
                  padding: 8,
                }}
              />

            {/* Derive total on the fly */}
            <Text style={{ flex: 1, textAlign: "center" }}>
              {row.total}

              
            </Text>


            <TouchableOpacity onPress={() => deleteRow(row.id)}>
              <Text style={{ color: "red", fontWeight: "bold" }}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

                                        <View style={{marginTop:20}}>
                                            <TouchableOpacity style={styles.submitAddStaff}  onPress={addProductRow}>
                                                <Text style={{color:"#fff", fontWeight:"bold"}}>+ Add Product</Text>
                                            </TouchableOpacity>
                                        </View>

                                       
                                        <View style={{marginTop:20}}>
                                            <TouchableOpacity style={styles.submitAddStaff} onPress={savePurchase}>
                                                <Text style={{color:"#fff", fontWeight:"bold"}}>Save Purchase</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <Text
                                          style={{
                                            fontSize: 20,      // bigger text
                                            fontWeight: "bold", // bold text
                                            marginTop: 10,      // optional spacing
                                            textAlign: "right", // optional alignment
                                            color: "#333",      // optional color
                                          }}
                                        >
                                          Total: ₱ {productRows.reduce((sum, row) => sum + Number(row.total || 0), 0)}
                                        </Text>
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
                    Are you sure you want to delete {staffToDelete?.fullName}?
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