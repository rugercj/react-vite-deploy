import React, { useEffect, useState } from "react";
import{View, TextInput, Button, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { auth } from '../services/firebaseConfig';
import CustomInput from "../components/customInput";
import CustomButton from "../components/customButton";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Platform } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";




export default function SuccessfullScreen(){
    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [emailError,setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigation = useNavigation();


    useEffect(()=>{
        const timer = setTimeout(() => {
            navigation.navigate("Login")
        }, 3000);

        return () => clearTimeout(timer)
    })



    return(
        <View style={styles.container}>
            <View style={styles.form}>
                <View style={styles.containerIcon}>
                    <MaterialIcons name="check-circle" size={30} color="green" />
                </View>
                <Text style={styles.heading}>Please login to continue!</Text>
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
    containerIcon:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },  
    form:{
        width:'100%',
        maxWidth:400,
        backgroundColor:'#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity:0.1,
        shadowRadius: 4,
        elevation: 5

    },

    label:{
        alignSelf:'flex-start',
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
        fontSize: 16
    },  
    input:{
        borderWidth: 1,
        padding: 8,
        marginVertical: 8
    },
    error:{
        color: 'red'
    },
    heading:{
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'center',
        color:'#333',
        textAlign:'center',

    },
    subtext:{
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
        textAlign:'center'
    },
    separatorContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20

    }, 
    line:{
        flex: 1,
        height: 1,
        backgroundColor: '#ccc'
    },
    separatorText:{
        marginHorizontal: 10,
        color: '#666',
        fontSize: 14,

    },
    googleButton:{
        backgroundColor: '#4285F4',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom:4
    },
    googleButtonText:{
        color:'#fff',
        fontWeight:'bold',
        fontSize: 16
    },

    errorText:{
        color: 'red',
        fontSize: 14,
        fontWeight:'200',
        marginTop: 6, 
        marginBottom: 2,
        textAlign: 'center'
    }


})