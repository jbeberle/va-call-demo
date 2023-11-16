import {createContext, useContext} from "react";
import {RTCPeerConnection} from "react-native-webrtc";

export type CallContextType = {
    peerConnection: RTCPeerConnection | null;
    setPeerConnection: (peerConnection: RTCPeerConnection) => void;
}

export const CallContext = createContext<CallContextType>({
    peerConnection: null,
    setPeerConnection: () => {}
});

export const useCallContext: () => CallContextType = () =>
    useContext(CallContext);
