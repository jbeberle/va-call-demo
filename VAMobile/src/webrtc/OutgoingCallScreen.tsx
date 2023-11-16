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
import {RTCSessionDescription} from "react-native-webrtc";
import {
    useCallContext
} from "../screens/BenefitsScreen/ClaimsScreen/ClaimDetailsScreen/ClaimStatus/CallContext/CallContext";

export const OutgoingCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    let callerId: string = props.sourceCallerId
    let otherUserId: string | null = props.destCallerId
    const socket = props.socket;
    const remoteRTCMessage = props.remoteRTCMessage;
    console.log("In OutgoingCallScreen")
    const peerConnection = props.peerConnection
    console.log("peerConnection=")
    console.log(peerConnection)

    const init = async () => {
        //console.log("Creating offer")
        //console.log(peerConnection)
        //const offer = await peerConnection!.createOffer();

        //console.log("setting local description")
        // set SDP offer as localDescription for peerConnection
        //peerConnection!.setLocalDescription(offer);

        console.log("emitting makeCall")
        socket.addEventListener('message', (ev) => {
            const data = JSON.parse(ev.data)
            console.log(data)
            if(data.message === "callAccepted") {
                console.log('accepted call!!!')
                console.log(data)
                console.log(ev.data)
                remoteRTCMessage.current = data.rtcMessage;
                peerConnection?.setRemoteDescription(
                    new RTCSessionDescription(remoteRTCMessage.current!)
                );

                sendOffer();


                setType("ACCEPTED_CALL")
            }
        })

        const sendOffer = async (): Promise<any> => {
            const sessionDescription = await peerConnection!.createOffer();
            await peerConnection!.setLocalDescription(sessionDescription);
            socket.send(JSON.stringify(
                {
                    message: 'offer',
                    calleeId: props.destCallerId,
                    rtcMessage: sessionDescription,
                }
            ))
        }

        // socket.send(JSON.stringify({
        //     "message": "makeCall",
        //     "type": "CLIENT",
        //     "calleeId": otherUserId,
        //     "sdpOffer": offer.toMap(),
        //     "room": "10"
        // })
        // );
        // console.log("after emit")

        return offer;
    }

    init();

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
                    Calling CRM...
                </Text>

                <Text
                    style={{
                        fontSize: 36,
                        marginTop: 12,
                        color: '#ffff',
                        letterSpacing: 6,
                    }}>
                    {otherUserId}
                </Text>
            </View>
            <View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <TouchableOpacity
                    onPress={() => {
                        socket.close();
                        setType('JOIN');
                        otherUserId = null;
                    }}
                    style={{
                        backgroundColor: '#FF5D5D',
                        borderRadius: 30,
                        height: 60,
                        aspectRatio: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <CallEnd width={50} height={12}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

