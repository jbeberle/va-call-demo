import MicOn from "./asset/MicOn";
import MicOff from "./asset/MicOff";
import VideoOn from "./asset/VideoOn";
import VideoOff from "./asset/VideoOff";
import CameraSwitch from "./asset/CameraSwitch";
import IconContainer from "./components/IconContainer";
import {MutableRefObject, useEffect, useRef, useState} from "react";
import {CallScreenPropType} from "./JoinScreen";
import {View} from "react-native";
import {RTCView, RTCPeerConnection, MediaStreamTrack, MediaStream} from "react-native-webrtc";
import InCallManager from 'react-native-incall-manager';
import CallEnd from "./asset/CallEnd";



export const WebrtcRoomScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    const callerId:string = props.callerId
    const otherUserId: MutableRefObject<null | string> = props.otherUserId
    const [localStream, setlocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // Handling Mic status
    const [localMicOn, setlocalMicOn] = useState(true);
    // Handling Camera status
    const [localWebcamOn, setlocalWebcamOn] = useState(true);

    // Switch Camera
    function switchCamera() {
        localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
            track._switchCamera();
        });
    }

    // Enable/Disable Camera
    function toggleCamera() {
        localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
        localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
            localWebcamOn ? (track.enabled = false) : (track.enabled = true);
        });
    }

    // Enable/Disable Mic
    function toggleMic() {
        localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
        localStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
            localMicOn ? (track.enabled = false) : (track.enabled = true);
        });
    }

    useEffect(() => {
        InCallManager.start();
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(true);

        return () => {
            InCallManager.stop();
        };
    }, []);

    const peerConnection = useRef(
        new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:jim.vmware.com:3478',
                },
                {
                    urls: 'turn:jim.vmware.com:3478',
                },
                {
                    urls: 'turn:jim.vmware.com:3478',
                },
            ],
        }),
    );

    let remoteRTCMessage = useRef(null);


    // Destroy WebRTC Connection
    function leave() {
        peerConnection.current.close();
        setlocalStream(null);
        setType("JOIN");
    }

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#050A0E",
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                }}
            >
                {localStream ? (
                    <RTCView
                        objectFit={"cover"}
                        style={{ flex: 1, backgroundColor: "#050A0E" }}
                        streamURL={localStream.toURL()}
                    />
                ) : null}
                {/*{remoteStream ? (*/}
                {/*    <RTCView*/}
                {/*        objectFit={"cover"}*/}
                {/*        style={{*/}
                {/*            flex: 1,*/}
                {/*            backgroundColor: "#050A0E",*/}
                {/*            marginTop: 8,*/}
                {/*        }}*/}
                {/*        streamURL={remoteStream.toURL()}*/}
                {/*    />*/}
                {/*) : null}*/}
                <View
                    style={{
                        marginVertical: 12,
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                    }}
                >
                    <IconContainer
                        style={{
                            borderWidth: 1.5,
                            borderColor: "#283034"
                        }}
                        backgroundColor={"red"}
                        onPress={() => {
                            leave();
                            setlocalStream(null);
                        }}
                        Icon={() => {
                            return <CallEnd height={26} width={26} fill="#FFF" />;
                        }}
                    />
                    <IconContainer
                        style={{
                            borderWidth: 1.5,
                            borderColor: "#2B3034",
                        }}
                        backgroundColor={!localMicOn ? "#fff" : "transparent"}
                        onPress={() => {
                            toggleMic();
                        }}
                        Icon={() => {
                            return localMicOn ? (
                                <MicOn height={24} width={24} fill="#FFF" />
                            ) : (
                                <MicOff height={28} width={28} fill="#1D2939" />
                            );
                        }}
                    />
                    <IconContainer
                        style={{
                            borderWidth: 1.5,
                            borderColor: "#2B3034",
                        }}
                        backgroundColor={!localWebcamOn ? "#fff" : "transparent"}
                        onPress={() => {
                            toggleCamera();
                        }}
                        Icon={() => {
                            return localWebcamOn ? (
                                <VideoOn height={24} width={24} fill="#FFF" />
                            ) : (
                                <VideoOff height={36} width={36} fill="#1D2939" />
                            );
                        }}
                    />
                    <IconContainer
                        style={{
                            borderWidth: 1.5,
                            borderColor: "#2B3034",
                        }}
                        backgroundColor={"transparent"}
                        onPress={() => {
                            switchCamera();
                        }}
                        Icon={() => {
                            return <CameraSwitch height={24} width={24} fill="#FFF" />;
                        }}
                    />
                </View>
            </View>
        );
    }

