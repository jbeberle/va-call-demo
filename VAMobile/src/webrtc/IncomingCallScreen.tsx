import CallAnswer from './asset/CallAnswer';
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

export const IncomingCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    const callerId:string = props.sourceCallerId
    const otherUserId: string = props.destCallerId

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
                            fontSize: 36,
                            marginTop: 12,
                            color: '#ffff',
                        }}>
                        {otherUserId} is calling..
                    </Text>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <TouchableOpacity
                        onPress={() => {
                            setType('WEBRTC_ROOM');
                        }}
                        style={{
                            backgroundColor: 'green',
                            borderRadius: 30,
                            height: 60,
                            aspectRatio: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <CallAnswer height={28} fill={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

