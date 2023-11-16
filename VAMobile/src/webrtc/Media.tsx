import {mediaDevices} from "react-native-webrtc";

export const video_constraints = {
    video: true,
    audio: true
};
export const audio_constraints = {
    video: false,
    audio: true
};

export class Media {
    // Note:  localStream is not being initialized until after the screen initially draws.
    //        We need to wait until the localStreeam is made.   We will need to update
    //        a state variable in AcceptedCallScreen if we need to get the localStream again.
    localStream: MediaStream | null = null;
    setLocalStream: (stream: MediaStream) => void
    useAudio: boolean = false;
    useVideo: boolean = true;

    getLocalStream = (): MediaStream => {
        console.log(`Media:  getting local stream: ${this.localStream}`)
        return this.localStream!
    }

    async init(): Promise<any> {
        function hasUserVideoMedia() {
            //check if the browser supports the WebRTC
            console.log("hasUserVideoMedia: ")
            console.log(!!(mediaDevices.getUserMedia(video_constraints)).catch((e) => console.log(e)))
            return !!(mediaDevices.getUserMedia(video_constraints)).catch((e) => console.log(e));
            ;
        }

        function hasUserAudioMedia() {
            //check if the browser supports the WebRTC
            return !!(mediaDevices.getUserMedia(audio_constraints)).catch((e) => console.log(e));
            ;
        }


        if (this.useVideo) {
            console.log("Found a myVideo tag!!!")
            if (hasUserVideoMedia()) {
                console.log("This device has video supported!!!")
                //enabling video and audio channels
                const devices = await mediaDevices.enumerateDevices();
                console.log("enumerated devices!")
                console.log(devices)
                const mediaStream = await mediaDevices.getDisplayMedia();
                console.log("got display media!!")
                console.log(mediaStream)
                console.log(this.setLocalStream)
                if(this.localStream == null || this.localStream == undefined) {
                    //this.setLocalStream(mediaStream)
                    this.setLocalStream(await mediaDevices.getUserMedia(video_constraints))
                }
               // this.setLocalStream(await mediaDevices.getUserMedia(video_constraints)) //.then(function (stream) {
                    // var video: HTMLVideoElement | null = document.querySelector('video');
                    // console.log("Got videos stream!")
                    //
                    // //inserting our stream to the video tag
                    // video!.srcObject = stream;
                // }, function (err) {
                // }).catch((e) => console.log(e));
                // ;
                console.log("this.localStream=")
                console.log(this.localStream)
            } else {
                alert("WebRTC Video is not supported");
            }
        }

        if (this.useAudio) {
            if (hasUserAudioMedia()) {
                this.setLocalStream(mediaDevices.getUserMedia(audio_constraints)) //.then(function (stream) {
                //     var audio: HTMLAudioElement | null = document.querySelector('audio');
                //     console.log("Got audio stream!")
                //
                //     //inserting our stream to the video tag
                //     audio!.srcObject = stream;
                // }, function (err) {
                // }).catch((e) => console.log(e));
                // ;
            } else {
                alert("WebRTC Audio is not supported");
            }
        }
    }

    constructor(peerConnection: RTCPeerConnection, localStream: MediaStream, setLocalStream: (stream: MediaStream) => void) {
        // mediaDevices.getUserMedia(constraints).
        // then(function(stream) { /* use the stream */ })
        //     .catch(function(err) { /* handle the error */ });
        console.log("setLocalStream=")
        console.log(setLocalStream)
        this.localStream = localStream;
        this.setLocalStream = setLocalStream;
        this.init();
        this.openStream(peerConnection).catch((e) => console.log(e));
    }

    setListener(peerConnection: RTCPeerConnection) {
        console.log("setListener called")
        // let audioElement: HTMLAudioElement = document.getElementById("myAudio") as HTMLAudioElement;
        peerConnection.ontrack = function (event) {
            console.log("ontrack called")
            //if(audioElement != null) {audioElement!.srcObject = event!.streams[0];}
        };
    }

    async openStream(peerConnection: RTCPeerConnection) {
        this.setListener(peerConnection)
        console.log("Open stream")
        if(this.useVideo) {
        // if (document.getElementById("myVideo")) {
             const gumStream = await mediaDevices.getUserMedia(video_constraints);
            for (const track of gumStream.getTracks()) {
                console.log("Adding track")
                peerConnection.addTrack(track, gumStream);
            }
        }
        if(this.useAudio) {
        // if (document.getElementById("myAudio")) {
            const gumStream = await mediaDevices.getUserMedia(audio_constraints);
            for (const track of gumStream.getTracks()) {
                console.log("Adding track")
                peerConnection.addTrack(track, gumStream);
            }
        }
    }
}


