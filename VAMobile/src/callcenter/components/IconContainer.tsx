import React from 'react';
import {TouchableOpacity} from 'react-native';


const buttonStyle = {
    height: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
};

type IconContainerPropType = {
    backgroundColor: any,
    onPress: any,
    Icon: () => void,
    style: any
}
const IconContainer = (props: IconContainerPropType) => {
    const backgroundColor: any = props.backgroundColor
    const onPress: any = props.onPress
    const Icon: any = props.Icon
    const style: any = props.style

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                ...style,
                backgroundColor: backgroundColor ? backgroundColor : 'transparent',
                borderRadius: 30,
                height: 60,
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Icon />
        </TouchableOpacity>
    );
};
export default IconContainer;