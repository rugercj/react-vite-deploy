import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";


export default function CustomButton({title, onPress}){
    return(
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

    button:{
        backgroundColor:'#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    text:{
        color:'#fff',
        fontWeight:'bold'
    }


})