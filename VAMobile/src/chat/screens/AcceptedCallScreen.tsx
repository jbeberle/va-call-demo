import {CallScreenPropType} from "./JoinScreen";
import {Text, View} from "react-native";
import {WebRtcChannel} from "../communication/WebRtcChannel";
import {VAScrollView} from "../../components";
import ChatScreen from "./ChatScreen";

export const AcceptedCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    let webRtcChannel: WebRtcChannel = new WebRtcChannel(props.socket)
    var done = false;

    async function sendMessage(message: string) {
        webRtcChannel.sendSocketMessage({event:"chat", from:"1", to:"2", message:message})
    }

    const onChat = (message:any) => {
        console.log("onChat!")
        console.log(message.value)
        props.setSendUserResponse!({message:message.value, sender:"user"})
        sendMessage(message.value).then(console.log("sent message!!"))
    }

    return (
        <>
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
                </View>
            </View>
        </>
    )
}