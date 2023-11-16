import {CallScreenPropType} from "../JoinScreen";
import {useEffect, useRef, useState} from "react";
import {mediaDevices, RTCPeerConnection} from "react-native-webrtc";

export const SourceNativeWebRtcChannel = (props: CallScreenPropType) => {
    const socket: WebSocket = props.socket
// Stream of local user
    const [localTrack, setlocalTrack] = useState<MediaStream | null>(null);

    /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
    const [remoteTrack, setRemoteTrack] = useState<MediaStreamTrack | null>(null);
    let isFront = false;

    /* This creates an WebRTC Peer Connection, which will be used to set local/remote descriptions and offers. */
    const iceConfiguration: RTCConfiguration = {
        iceServers: [
            {
                urls: 'turn:jim.vmware.com:3478',
                username: 'ejim',
                credential: 'TannerAndTobey100!'
            },
        ]
    }

    const peerConnection = useRef(
        new RTCPeerConnection(iceConfiguration),
    );

    const handleIceCandidate = (ev: MessageEvent<any>) => {
        const data = JSON.parse(ev.data)
        console.log(data)
        if (data.message === "ICEcandidate") {
            console.log('got ICEcandidate!!!')
            console.log(data)
            console.log(ev.data)
            if (data.calleeId === props.sourceCallerId) {
                socket.send(JSON.stringify
                ({
                    "message": "ICEcandidate",
                    "sender": data.sender,
                    "rtcMessage": data.rtcMessage
                }))
            }
        }
    }

    useEffect(() => {


        socket.addEventListener('message', (ev) => {
            handleIceCandidate(ev);
        });

        mediaDevices.enumerateDevices().then((sourceInfos) => {
            let videoSourceId;
            sourceInfos.forEach((sourceInfo: any) => {
                if (
                    sourceInfo.kind == 'videoinput' &&
                    sourceInfo.facing == (isFront ? 'user' : 'environment')
                ) {
                    videoSourceId = sourceInfo.deviceId;
                }

            })

            mediaDevices
                .getUserMedia({
                    audio: true,
                    video: {
                        mandatory: {
                            minWidth: 500, // Provide your own width, height and frame rate here
                            minHeight: 300,
                            minFrameRate: 30,
                        },
                        facingMode: isFront ? 'user' : 'environment',
                        optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
                    },
                })
                .then((stream: any) => {
                    // Get local stream!
                    setlocalTrack(stream.stream);

                    // setup stream listening
                    // peerConnection.current.addStream(stream);
                    stream.stream.getTracks().forEach((track: MediaStreamTrack) => peerConnection.current.addTrack(track, stream.stream))

                })
                .catch(error => {
                    // Log error
                });
        });

        peerConnection.current.ontrack = event => {
            setRemoteTrack(event.track);
        };

        // Setup ice handling
        peerConnection.current.onicecandidate = event => {

        };
        return () => {
            socket.removeEventListener('message', handleIceCandidate);
        }
    }, []);

    return (
        <>
        </>
    );


}