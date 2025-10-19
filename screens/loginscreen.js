import React, { useState } from "react";
import{View, TextInput, Button, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from '../services/firebaseConfig';
import CustomInput from "../components/customInput";
import CustomButton from "../components/customButton";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, query, getDocs, where, collection } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function LoginScreen(){
    const [username,setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [usernameError,setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigation = useNavigation();


 
    const handleLogin = async () => {
        let valid = true;
        setUsernameError('');
        setPasswordError('');

        if (!username || !password) {
            setUsernameError('Username and password are required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }

        if (!valid) return;

        try {
            // 🔍 Look up user by username
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setUsernameError("Username not found");
                return;
            }

            const user = querySnapshot.docs[0].data();

            if (user.password !== password) {
                setPasswordError("Incorrect password");
                return;
            }


             // ✅ Save logged-in user in AsyncStorage
            await AsyncStorage.setItem("loggedInUser", JSON.stringify(user));

            // ✅ Login successful
            if (user.role === "admin") {
                navigation.navigate("MainApp");
            } else {
                setPasswordError("Access denied. Only admins allowed.");
            }

        } catch (error) {
            console.error(error);
            setPasswordError("Something went wrong. Try again.");
        }
    };

    return(
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.heading}>Log in</Text>
                <Text style={styles.subtext}>Please log in to continue.</Text>
                <Text style={styles.label}>Username</Text>
                <CustomInput value={username} setValue={setUsername} placeholder="Username"/>
                
                <Text style={styles.label}>Password</Text>
                <CustomInput value={password} setValue={setPassword} placeholder="Password" secureTextEntry/>
                
                {error ? <Text>{error}</Text> : null}
                <CustomButton title="Login" onPress={handleLogin}/>

                <View style={styles.separatorContainer}>
                    <View style={styles.line}/> 
                    <View style={styles.line}/>
                </View>
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text>: null}
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text>:null}

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