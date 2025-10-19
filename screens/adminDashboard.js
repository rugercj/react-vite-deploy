import React, { useState } from "react";
import{View, TextInput, Button, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from '../services/firebaseConfig';
import CustomInput from "../components/customInput";
import CustomButton from "../components/customButton";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";



export default function AdminDashboard(){

    return(
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.heading}>Admin Dashboard</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems:'center',
        padding: 20,
        backgroundColor:'lightblue'
    },
    form:{
        width:'100%',
        maxWidth:300,
        backgroundColor:'#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity:0.1,
        shadowRadius: 4,
        elevation: 5

    },
    heading:{
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'center',
        color:'#333'
    },


})