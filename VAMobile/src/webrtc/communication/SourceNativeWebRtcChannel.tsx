import * as io from "socket.io-client";
import {useEffect, useRef, useState} from "react";
import {CallScreenPropType} from "../JoinScreen";
import {mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription,} from 'react-native-webrtc';
import InCallManager from "react-native-incall-manager";

export const SourceNativeWebRtcChannel = (props: CallScreenPropType) => {
    const [localMicOn, setlocalMicOn] = useState(true);
    const [localStream, setlocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteTrack, setRemoteTrack] = useState<MediaStreamTrack | null>(null);
    const sourceCallerId = props.sourceCallerId
    const destCallerId = props.destCallerId

    const [localWebcamOn, setlocalWebcamOn] = useState(true);
    const socket: io.Socket = props.socket
    let otherUserId: string = props.destCallerId
    const type: string = props.type
    const setType: (type: string) => void = props.setType

    const peerConnection = useRef(
        new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:jim.vmware.com:3478',
                    username: 'ejim',
                    credential: 'TannerAndTobey100!'
                }
            ]
        }),
    );

    let remoteRTCMessage = useRef(null);

    useEffect(() => {

        // // make a call to remote peer over signalling
        socket.on('makeCall', (...data: [rtcMessage: any, callerId: any, offer:any])
        {
            remoteRTCMessage.current = data[0]
            otherUserId = data[1]
        })
            // create SDP Offer
            const offer = await peerConnection!.current.createOffer(null);

            // set SDP offer as localDescription for peerConnection
            await peerConnection!.current.setLocalDescription(offer);

            socket.emit('newCall', , {
                "callerId": sourceCallerId,
                "sdpOffer": offer.toMap(),
            })
        );


        socket.on('newCall', (...data: [rtcMessage: any, callerId: any]) => {
            remoteRTCMessage.current = data[0];
            otherUserId = data[1];
            setType('INCOMING_CALL');
        });

        socket.on('callAnswered', (...data: [rtcMessage: any]) => {
            remoteRTCMessage.current = data[0];
            peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessage.current!),
            );
            setType('WEBRTC_ROOM');
        });

        socket.on('ICEcandidate', (...data: [rtcMessage: any]) => {
            let message = data[0];

            if (peerConnection.current) {
                let p: any = peerConnection?.current
                    .addIceCandidate(
                        new RTCIceCandidate({
                            candidate: message.candidate,
                            sdpMid: message.id,
                            sdpMLineIndex: message.label,
                        })
                    )
                p.then((data: any) => {
                    console.log('SUCCESS' + data);
                })
                p.catch((err: any) => {
                    console.log('Error', err);
                });
            }
        });

        let isFront = false;

        const m: any = mediaDevices.enumerateDevices()
        m.then((sourceInfos: MediaDeviceInfo[]) => {
            let videoSourceId;
            for (let sourceInfo of sourceInfos) {
                if (
                    sourceInfo.kind == 'videoinput' // &&
                    //sourceInfo.facing == (isFront ? 'user' : 'environment')
                ) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }

            const m2:any = mediaDevices
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

               m2.then((stream: any) => {
                    // Got stream!

                    setlocalStream(stream);

                    // setup stream listening
                   for (const track of stream.getTracks()) {
                       console.log("Adding track")
                       peerConnection.current.addTrack(track, stream);
                   }
                })

                m2.catch((error: any) => {
                    // Log error
                });
        });

        peerConnection.current.addEventListener('track', (event:any) => {
            setRemoteTrack((event as RTCTrackEvent).track);
        });

        // Setup ice handling
        peerConnection.current.addEventListener('icecandidate' , (event: any) => {
            if (event.candidate) {
                sendICEcandidate({
                    calleeId: otherUserId,
                    rtcMessage: {
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate,
                    },
                });
            } else {
                console.log('End of candidates.');
            }
        });

        return () => {
            socket.off('newCall');
            socket.off('callAnswered');
            socket.off('ICEcandidate');
        };
    }, []);

    useEffect(() => {
        InCallManager.start();
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(true);

        return () => {
            InCallManager.stop();
        };
    }, []);

    function sendICEcandidate(data: any) {
        socket.emit('ICEcandidate', data);
    }

    async function processCall() {
        const sessionDescription = await peerConnection.current.createOffer(null);
        await peerConnection.current.setLocalDescription(sessionDescription);
        sendCall({
            calleeId: otherUserId,
            rtcMessage: sessionDescription,
        });
    }

    async function processAccept() {
        peerConnection.current.setRemoteDescription(
            new RTCSessionDescription( remoteRTCMessage.current! ),
        );
        const sessionDescription = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(sessionDescription);
        answerCall({
            callerId: otherUserId,
            rtcMessage: sessionDescription,
        });
    }

    function answerCall(data: any) {
        socket.emit('answerCall', data);
    }

    function sendCall(data: any) {
        socket.emit('call', data);
    }
   return (
       <>
       </>
   );


}