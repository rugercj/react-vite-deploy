import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AdminDashboard from './adminDashboard';
import Staff from '../masterscreen/staff';
import { useWindowDimensions } from 'react-native';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomDrawerContent from './customDrawerContent';


import Customer from '../masterscreen/customer';
import Packages from '../masterscreen/packages';
import Suppliers from '../masterscreen/supplier';
import ExpensesMaster from '../masterscreen/expensesmaster';
import Product from '../masterscreen/product';
import Services from '../masterscreen/services';

import PurchaseFromSupplier from '../maintransaction/purchasefromsupplier';
import ExpensesTransaction from '../maintransaction/expensestransaction';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const {width} = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const CustomDrawer = props => {
    return(
      <View style={styles.container}>
        <DrawerContentScrollView {...props}>
          <View style={styles.companylogo}>
            <Image source={require('../assets/barb.jpg')} style={styles.logo}/>
            <Text>Barbershop App</Text>
          </View>
          <View style={styles.menubuttons}>
            <DrawerItemList {...props}/>
          </View>
          
        </DrawerContentScrollView>
        
      </View>
    )
  }


  return (

    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props}/>}
      screenOptions={({ navigation }) => ({
        drawerItemStyle:{display:'none'},
        drawerType: isLargeScreen ? 'permanent' : 'front',
        headerLeft: () =>
          !isLargeScreen ? (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name='menu' size={24}/>
            </TouchableOpacity>
          ) : null,
      headerTitle:"", headerTransparent:true})}
      
    >
      <Drawer.Screen name="Purchases" component={PurchaseFromSupplier} options={{title:"Purchases From Supplier"}}/>
      <Drawer.Screen name="ExpensesTransaction" component={ExpensesTransaction} options={{title:"Expenses Transaction"}}/>
      <Drawer.Screen name="Sales" component={AdminDashboard} options={{title:"Sales"}}/>


      <Drawer.Screen name="Staff" component={Staff} options={{title:"Staff"}}/>
      <Drawer.Screen name="Customers" component={Customer} options={{title:"Customers"}}/>
      <Drawer.Screen name="Packages" component={Packages} options={{title:"Packages"}}/>
      <Drawer.Screen name="Products" component={Product} options={{title:"Products"}}/>
      <Drawer.Screen name="Suppliers" component={Suppliers} options={{title:"Suppliers"}}/>
      <Drawer.Screen name="ExpensesMaster" component={ExpensesMaster} options={{title:"Expenses Master"}}/>
      <Drawer.Screen name="Services" component={Services} options={{title:"Services"}}/>


      <Drawer.Screen name="Reports" component={AdminDashboard} options={{title:"Reports"}}/>
      <Drawer.Screen name="Charts" component={AdminDashboard} options={{title:"Charts"}}/>


      <Drawer.Screen name="Help" component={AdminDashboard} options={{title:"Help"}}/>
      <Drawer.Screen name="License" component={AdminDashboard} options={{title:"Enter License"}}/>

    </Drawer.Navigator>
  );
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
    }


})