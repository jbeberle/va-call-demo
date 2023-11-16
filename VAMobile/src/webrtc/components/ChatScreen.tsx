import React, { useState, useEffect, useRef } from "react-native";
// import  "../asset/Chats.css";
import {Text} from "react-native";
import {Box, ButtonTypesConstants, TextArea, TextView, VAButton, VATextInput} from "../../components";
import {FeatureConstants, overrideLocalVersion} from "../../utils/homeScreenAlerts";

interface Props {
    userResponse: string;
    botResponse: {
        purpose: string;
        message: string;
        options?: string[];
        sender: string;
    };
    sendUserResponse: string;
    messages: MessagesInfo[];
    onSubmit: () => void
}

export interface MessagesInfo {
    purpose?: string;
    message: string;
    options?: string[];
    sender: string;
}



const Chats: React.FC<Props> = props => {
    const [messages, sendUserResponse, setSendUserResponse, onSubmit] =
        [props.messages, props.sendUserResponse, props.setSendUserResponse, props.onSubmit]
;
    let step:number = 0
    const setStep = (num:number) => step = num;
    let message:string = ""
    const setMessage = (msg: string) => message = msg;

    const setNextStep = (response: MessagesInfo) => {
        setStep(step + 1);
        // props.setSendUserResponse(response);
        //let res = analyzeNextSteps(step, response);
        //setBotResponse({ ...res, sender: "bot" });
        //props.setMessage("");
    };

    function handleInputChange(value: MessagesInfo) {
        // props.setSendUserResponse(value);
        setMessage({ ...message,  value });
    }

    function onClick() {
        setNextStep(message);
        onSubmit(message);
    }

    console.log("Chat Messages")
    console.log(props.messages)
    return (
        // <div className="message-container"  key="ChatID">
        <>
            {messages.map(chat => (
                // <div key={chat.message}>
                //     <div className={`message ${chat.sender}`}>
                //         <p>{chat.message}</p>
                //     </div>
                //     {chat.options ? (
                //         <div className="options">
                //             <div>
                //                 <i className="far fa-hand-pointer"></i>
                //             </div>
                //         </div>
                //     ) : null}
                //     <div ref={dummyRef} className="dummy-div"></div>
                // </div>
                <TextView key={Math.random()} variant="MobileBody" >
                    {chat.sender}: {chat.message}
                </TextView>
            // <Text
            //     key={Math.random() * 10000}
            //     style={{
            //         fontSize: 10,
            //         marginTop: 12,
            //         color: '#000000',
            //         letterSpacing: 6,
            //     }}>
            //     {chat.message}
            // </Text>
            ))
            }
            <Box>
                <VATextInput
                    inputType={'none'}
                    onChange={(val) => {
                        if (val.length >= 1) {
                            overrideLocalVersion(FeatureConstants.WHATSNEW, val)
                            handleInputChange(val)
                        } else {
                            overrideLocalVersion(FeatureConstants.WHATSNEW, undefined)
                            handleInputChange("")
                        }
                    }}>
                    Hi
                </VATextInput>

                <TextArea>
                    <VAButton onPress={onClick} label={'Send Message'} buttonType={ButtonTypesConstants.buttonPrimary} />
                </TextArea>
            </Box>

        </>
        // </div>
    );
};

export default Chats;
