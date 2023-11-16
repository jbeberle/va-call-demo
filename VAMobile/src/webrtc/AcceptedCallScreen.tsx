import {CallScreenPropType} from "./JoinScreen";
import {Animated, ScrollView, Text, View} from "react-native";
import {SourceNativeWebRtcChannel} from "./communication/SourceNativeWebRtcChannel";
import {useEffect, useState} from "react";
import {RTCSessionDescription, RTCView} from "react-native-webrtc";
import {SignallingChannel} from "./communication/SignallingChannel";
import {WebRtcChannel} from "./communication/WebRtcChannel";
import delay = Animated.delay;
import ChatScreen from "./components/ChatScreen";
import {VAScrollView} from "../components";

export const AcceptedCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    console.log("AcceptedCallScreen:  setLocalStream=")
    console.log(props.setLocalStream)
    let webRtcChannel: WebRtcChannel = new WebRtcChannel(props.socket, props.localStream!, props.setLocalStream!)
    webRtcChannel.initChannel();
    var done = false;



    async function checkLocalStream() {
        for(var i = 0; i<300 && !done; i++) {
            // Do something before delay
            // console.log('before delay');

            await delay(1000);
            var newStream:MediaStream | null = webRtcChannel.getLocalStream();
            if(newStream != null) {
                console.log("checkLocalStream:  setting message to " + newStream);
                props.setLocalStream!(newStream)
                done=true
            }
        }
        console.log("done")
    };

   checkLocalStream();

    const init =  () => {
        console.log("Initing Channel!!!")
        // webRtcChannel.initChannel();
        // setLocalStream(webRtcChannel.getLocalStream())
        // console.log("localStream=")
        // console.log(localStream)

        // let peerConnection = props.peerConnection
        // const sessionDescription = peerConnection!.createOffer();
        // peerConnection!.setLocalDescription(sessionDescription);
        // socket.send(JSON.stringify(
        //     {
        //         message: 'offer',
        //         calleeId: props.destCallerId,
        //         rtcMessage: sessionDescription,
        //     }
        // ))

        // socket.addEventListener('message', (ev) => {
        //     const data = JSON.parse(ev.data)
        //     console.log(data)
        //     if (data.message === "answerOffer") {
        //         const peerConnection = props.peerConnection
        //         console.log('answered offer!!!')
        //         console.log(data)
        //         console.log(ev.data)
        //         peerConnection?.setLocalDescription(data.rtcMessage);
        //     }

        // })
        return () => {

        }
    };

    async function sendMessage(message: string) {
        //webRtcChannel.sendDataChannelMessage(message);
        webRtcChannel.sendSocketMessage({event:"chat", from:"1", to:"2", message:message})
    }

    const onChat = (message:any) => {
        console.log("onChat!")
        console.log(message.value)
        //props.messages!.push({message: message.value, sender:"user"})
        props.setSendUserResponse!({message:message.value, sender:"user"})
        sendMessage(message.value).then(console.log("sent message!!"))
    }
    // useEffect(() => {
    //     init();
    // }, []);


    // init();

    return (
        <>
            <SourceNativeWebRtcChannel {...props}/>
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
                            fontSize: 24,
                            marginTop: 12,
                            color: '#ffff',
                            letterSpacing: 6,
                        }}>
                    Call Accepted.   {!props.localStream? "Please wait..." : ""}
                    </Text>
                </View>
                    <View
                        style={{
                            padding: 35,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 14,
                        }}>
                        <VAScrollView>
                            <ChatScreen  sendUserResponse={props.sendUserResponse}
                                         setSendUserResponse={props.setSendUserResponse}
                                         messages={props.messages}
                                         onSubmit={onChat}
                            />
                       </VAScrollView>
                    {props.localStream? (
                        <RTCView
                            id={"myVideo"}
                            objectFit={"cover"}
                            style={{ flex: 1, backgroundColor: "#050A0E" }}
                            streamURL={props.localStream.toURL()}
                        />
                    ) : <Text
                        style={{
                                fontSize: 24,
                                marginTop: 12,
                                color: '#ffff',
                                letterSpacing: 6,
                            }}>
                           Media device not found
                        </Text>}
                </View>
            </View>
        </>
    )
}