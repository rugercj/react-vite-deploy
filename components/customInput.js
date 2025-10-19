import React from "react";
import { TextInput, StyleSheet } from "react-native";


export default function CustomInput({value, setValue, placeholder, secureTextEntry}){
    return(
        <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            style = {styles.input}
        
        
        />
    )
}

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor:'#ccc',
        borderRadius: 8,
        padding: 12,
        marginVertical:8,
        width: '100%'
    }
})