import React, { useState } from "react";
import{View, TextInput, Button, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { auth } from '../services/firebaseConfig';
import CustomInput from "../components/customInput";
import CustomButton from "../components/customButton";
import { doc, getDoc, serverTimestamp, setDoc, collection, query, where, getDocs} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { v4 as uuidv4 } from "uuid"; // npm install uuid




export default function RegisterScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");

    const navigation = useNavigation();

    const handleRegister = async () => {
        let valid = true;
        setUsernameError('');
        setPasswordError('');
        setError('');

        // Basic validation
        if (!username || !password) {
            setUsernameError("Username and password are required");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            valid = false;
        }

        if (!valid) return;

        try {
            // Check if username already exists
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setUsernameError("Username already exists");
                return;
            }

            // Generate a unique ID for the user
            const uid = uuidv4();

            // Save the new user in Firestore
            await setDoc(doc(db, "users", uid), {
                uid,
                username,
                password,  // 🔒 Later: hash this using bcrypt
                role: "admin", // or "staff"
                createdAt: serverTimestamp()
            });

            navigation.navigate("SuccessfullScreen");

        } catch (err) {
            console.error(err.message);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.heading}>Register</Text>
                <Text style={styles.subtext}>Create your account to access all features. It's quick and easy!</Text>
                <Text style={styles.label}>Username</Text>
                <CustomInput value={username} setValue={setUsername} placeholder="Username"/>
                
                <Text style={styles.label}>Password</Text>
                <CustomInput value={password} setValue={setPassword} placeholder="Password" secureTextEntry/>
                
                {error ? <Text>{error}</Text> : null}
                <CustomButton title="Register" onPress={handleRegister}/>

                <View style={styles.separatorContainer}>
                    <View style={styles.line}/> 
                    <View style={styles.line}/>
                </View>
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text>: null}
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text>:null}

            </View>
        </View>
    );
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
        color:'#333'
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

