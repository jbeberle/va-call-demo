import {SignallingChannel} from "./SignallingChannel";

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
    signalingChannel: SignallingChannel ;

    constructor(socket: WebSocket) {
        newMessage = null;
        this.signalingChannel = new SignallingChannel(socket);
    }

    sendSocketMessage(message:any) {
        this.signalingChannel.send(message)
    }


}

