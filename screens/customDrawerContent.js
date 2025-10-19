import React from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {useSharedValue, useAnimatedStyle} from "react-native-reanimated";
import { interpolate } from "react-native-reanimated";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList  } from "@react-navigation/drawer";
import { useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { withTiming } from "react-native-reanimated";

import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // modern icons


import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";



export default function CustomDrawerContent (props){

    const [showDashboardSubMenu, setShowDashboardSubMenu] = React.useState(false)
    const [showMasterMenu, setShowMasterMenu] = React.useState(false)
    const [showReportsMenu, setShowReportsMenu] = React.useState(false)
    const [showHelpMenu, setShowHelpMenu] = React.useState(false)
    const [showLicenseMenu, setShowLicenseMenu] = React.useState(false)


    const navigation = useNavigation();

    const handleLogout = async () => {
      try {
        // Clear logged in user
        await AsyncStorage.removeItem("loggedInUser");

        navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
      } catch (error) {
        console.error("Logout failed", error);
      }
    };

    return (
      <View style={styles.container}>
        <DrawerContentScrollView {...props}>
          <View style={styles.companylogo}>
            <Image source={require('../assets/barb.jpg')} style={styles.logo}/>
            <Text>Barbershop App</Text>
          </View>

          <DrawerItemList {...props}/>

          
          <TouchableOpacity
              onPress={()=> setShowDashboardSubMenu(prev => !prev)}
              style={{padding:10}}
          >
            <Text style={{fontSize:16, fontWeight:'bold'}}>
              Main Transaction {showDashboardSubMenu ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

           {showDashboardSubMenu && (
            <View style={{paddingLeft: 20}}>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Purchases')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Purchases From Supplier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('ExpensesTransaction')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Expenses Transaction</Text>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Sales')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Sales</Text>
              </TouchableOpacity>

            </View>
          )}


          <TouchableOpacity
            onPress={()=> setShowMasterMenu(prev => !prev)}
            style={{padding:10}}
          >
            <Text style={{fontSize: 16, fontWeight:'bold'}}>
              Master {showMasterMenu ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>


           {showMasterMenu && (
              <View style={{paddingLeft: 20}}>
              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Staff')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Staff</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Customers')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Customers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Packages')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Packages</Text>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Products')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Products</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Suppliers')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Suppliers</Text>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={()=> props.navigation.navigate('ExpensesMaster')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Expenses Master</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Services')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Services</Text>
              </TouchableOpacity>
            </View>
          )}


          <TouchableOpacity
            onPress={()=> setShowReportsMenu(prev => !prev)}
            style={{padding:10}}
          >
            <Text style={{fontSize: 16, fontWeight:'bold'}}>
              Reports {showReportsMenu ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showReportsMenu && (
            <View style={{paddingLeft: 20}}>
              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Reports')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Charts')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Charts</Text>
              </TouchableOpacity>
            </View>

          )}

          <TouchableOpacity
            onPress={()=> setShowHelpMenu(prev => !prev)}
            style={{padding:10}}
          >
            <Text style={{fontSize: 16, fontWeight:'bold'}}>
              Help {showHelpMenu ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showHelpMenu && (
            <View style={{paddingLeft: 20}}>
              <TouchableOpacity
                onPress={()=> props.navigation.navigate('Help')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Help</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={()=> setShowLicenseMenu(prev => !prev)}
            style={{padding:10}}
          >
            <Text style={{fontSize: 16, fontWeight:'bold'}}>
              License {showLicenseMenu ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>


          {showLicenseMenu && (
            <View style={{paddingLeft: 20}}>
              <TouchableOpacity
                onPress={()=> props.navigation.navigate('License')}
                style={{paddingVertical: 8}}
              >
                <Text style={{fontSize: 14}}>Enter License</Text>
              </TouchableOpacity>
            </View>
          )}

        </DrawerContentScrollView>

        <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={20} color="#fff" style={{marginRight:8}} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      </View>
      
    )
  }
const styles = StyleSheet.create({
      container: {
        flex: 1
  
      },
  
      logo: {
        height: 100,
        width: 100,
      }, 
      companylogo:{
        justifyContent:'center',
        alignItems:'center',
        marginBottom:15
      },
      menubuttons:{
        padding:15,
        gap: 10
      },
       footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4B4B",
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  
  
  })