import {SignallingChannel} from "./SignallingChannel";
import {Media} from "../Media";
import {mediaDevices, RTCPeerConnection} from "react-native-webrtc";

let newMessage: string |  null = null;

export const getNewMessage = (): string | null => {
    const message = newMessage;
    newMessage = null;
    return message;
}

export const setNewMessage = (message: string) => {
    newMessage = message;
}

export class WebRtcChannel {
    iceConfiguration: RTCConfiguration;

    peerConnection: RTCPeerConnection ;
    signalingChannel: SignallingChannel ;
    dataChannel: RTCDataChannel ;
    media: Media ;
    localMediaStream: MediaStream;
    setLocalMediaStream: (stream:MediaStream) => void
    // addMessage: FormProps | null = null;

    getLocalStream(): MediaStream {
        console.log("WebRtcChannel:  getting local stream")
        return this.media.getLocalStream();
    }

    // constructor(addMessage: FormProps) {
    constructor(socket: WebSocket, localStream: MediaStream, setLocalStream: (stream:MediaStream) => void) {
        // this.addMessage = addMessage;
        this.iceConfiguration = {
            iceServers: [
                {
                    urls: 'turn:jim.vmware.com:3478',
                    username: 'ejim',
                    credential: 'TannerAndTobey100!'
                }
            ]
        }

        newMessage = null;
        this.localMediaStream = localStream;
        this.setLocalMediaStream = setLocalStream;
        this.peerConnection = new RTCPeerConnection(this.iceConfiguration);
        this.signalingChannel = new SignallingChannel(this.peerConnection, socket);
        console.log("WebRtcChannel:  setLocalMedia=")
        console.log(setLocalStream)
        this.media = new Media(this.peerConnection, this.localMediaStream, this.setLocalMediaStream);

        this.dataChannel = this.peerConnection.createDataChannel("dataChannel");
        console.log("Create data channel")
        console.log(this.dataChannel)

        this.dataChannel.onerror = function (error) {
            console.log("Error:", error);
        };

        this.dataChannel.onopen = function() {
           console.log("Data channel is open")
        }

        this.dataChannel.onclose = function () {
            console.log("Data channel is closed");
        };

        this.dataChannel.onmessage = function (event) {
            console.log("onmessage Message:", event.data);
            newMessage = event.data;
            // addMessage.setSendUserResponse(event.data);
        };

        this.peerConnection.ondatachannel =  (event) => {
            console.log("data channel opened on this peer connection")
            this.dataChannel = event.channel;
        };


        this.peerConnection.onicecandidate =  (event) => {
            if (event.candidate) {
                this.signalingChannel.send({
                    event: "candidate",
                    data: event.candidate
                });
            }
        }
    }

    async initChannel()  {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.createOffer((offer) => {
            this.signalingChannel.send({
                event : "offer",
                data : offer
            });
            this.peerConnection.setLocalDescription(offer);
            console.log("Done initializing Channel")
        }, function(error) {
            // Handle error here
        });

    }


    sendDataChannelMessage(message: any) {
        console.log("Sending message over data channel:")
        console.log(message)
        this.dataChannel.send(message);
    }

    sendSocketMessage(message:any) {
        console.log("Sending message over data channel:")
        console.log(message)
        this.signalingChannel.send(message)
    }


}

