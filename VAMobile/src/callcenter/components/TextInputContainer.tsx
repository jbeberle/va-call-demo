import React from 'react';
import {View, TextInput} from 'react-native';
import {VATextInput} from "../../components";

export type TextInputProps = {
    placeholder: any,
    value: any,
    setValue: any,
    keyboardType: any,
}

const TextInputContainer = (props: TextInputProps) => {
    const placeholder: any = props.placeholder
    const value: any = props.value
    const keyboardType: any = props.keyboardType
    const setValue: any = props.setValue;

    return (
        <View
            style={{
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#202427',
                borderRadius: 12,
                marginVertical: 12,
            }}>
            <TextInput
                style={{
                    margin: 8,
                    padding: 8,
                    width: '90%',
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#FFFFFF',
                }}
                multiline={true}
                numberOfLines={1}
                cursorColor={'#5568FE'}
                placeholder={placeholder}
                placeholderTextColor={'#9A9FA5'}
                onChangeText={(text:string) => {
                    setValue(text);
                }}
                value={value}
                keyboardType={keyboardType}
            />
        </View>
    );
};

export default TextInputContainer;

