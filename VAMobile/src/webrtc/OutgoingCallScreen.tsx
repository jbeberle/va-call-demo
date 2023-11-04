import CallEnd from './asset/CallEnd';
import {
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import {CallScreenPropType} from "./JoinScreen";
import {MutableRefObject} from "react";

export const OutgoingCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    const callerId:string = props.sourceCallerId
    const otherUserId: string = props.destCallerId
    const socket = props.socket;
    console.log("In OutgoingCallScreen")

    return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'space-around',
                    backgroundColor: '#050A0E',
                }}>
                <View
                    style={{
                        padding: 35,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 14,
                    }}>
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#D0D4DD',
                        }}>
                        Calling to...
                    </Text>

                    <Text
                        style={{
                            fontSize: 36,
                            marginTop: 12,
                            color: '#ffff',
                            letterSpacing: 6,
                        }}>
                        {otherUserId.current}
                    </Text>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <TouchableOpacity
                        onPress={() => {
                            socket.disconnect();
                            setType('JOIN');
                            otherUserId.current = null;
                        }}
                        style={{
                            backgroundColor: '#FF5D5D',
                            borderRadius: 30,
                            height: 60,
                            aspectRatio: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <CallEnd width={50} height={12} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
