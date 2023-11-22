import {StackScreenProps} from '@react-navigation/stack/lib/typescript/src/types'
import {useTranslation} from 'react-i18next'
import React, {FC, useEffect, useRef, useState} from 'react'

import {BenefitsStackParamList} from 'screens/BenefitsScreen/BenefitsStackScreens'
import {Box, LargePanel, TextView} from 'components'
import {NAMESPACE} from 'constants/namespaces'
import {a11yHintProp} from 'utils/accessibility'
import {a11yLabelVA} from 'utils/a11yLabel'
import {useRouteNavigation, useTheme} from 'utils/hooks'
import {useSelector} from "react-redux";
import {RootState} from "../../../../../../store";
import {MilitaryServiceState} from "../../../../../../store/slices";
import {useAuthorizedServices} from "../../../../../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../../../../../api/personalInformation/getPersonalInformation";
import {MessagesInfo} from "../../../../../../chat/screens/ChatScreen";
import {getNewMessage} from "../../../../../../chat/communication/WebRtcChannel";
import {JoinScreen} from "../../../../../../chat/screens/JoinScreen";
import {OutgoingCallScreen} from "../../../../../../chat/screens/OutgoingCallScreen";
import {AcceptedCallScreen} from "../../../../../../chat/screens/AcceptedCallScreen";
import {CallClaimDetailsScreen} from "../../../../../../chat/screens/CallClaimDetailsScreen";

type PlaceCallProps = StackScreenProps<BenefitsStackParamList, 'PlaceCall'>


interface ResponseBotObject {
    purpose: string;
    message: string;
    options?: string[];
    sender: string;
}


const PlaceCall: FC<PlaceCallProps> = ({route}) => {
    const {t} = useTranslation(NAMESPACE.COMMON)
    const theme = useTheme()
    const {callCenterPhone, claimId, claimType, claimPhase, claims} = route.params
    console.log("Route=")
    console.log(route)
    console.log("callCenterPhone=")
    console.log(callCenterPhone)
    const [type, setType] = useState('CALL_CLAIM_DETAILS');
    const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
    const [sendUserResponse, setSendUserResponse] = useState<MessagesInfo>({message: "", sender: ""});
    const [updateState, setUpdateState] = useState<number>(0)
    const messages = useRef<MessagesInfo[]>([]);

    const [botResponse, setBotResponse] = useState<MessagesInfo>({
        purpose: "",
        message: "",
        sender: "bot"
    });


    let sourceCallerId = "1"
    let destCallerId = "800-827-1000";
    let room = "10";
    const iceConfiguration: RTCConfiguration =
        {
            iceServers: [
                {
                    urls: 'turn:jim.vmware.com:3478',
                    username: 'ejim',
                    credential: 'TannerAndTobey100!'
                }
            ]
        }

    const {mostRecentBranch, serviceHistory} = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const {data: userAuthorizedServices} = useAuthorizedServices()
    const {data: personalInfo} = usePersonalInformation()
    const accessToMilitaryInfo = userAuthorizedServices?.militaryServiceHistory && serviceHistory.length > 0
    const navigateTo = useRouteNavigation()

    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''

    const onDecisionReview = async (): Promise<void> => {
        //launchExternalLink(LINK_URL_DECISION_REVIEWS, { claim_id: claimId, claim_type: claimType, claim_step: claimPhase, claims callCenterPhone })
    }

    const socket = new WebSocket('ws://10.0.0.242:8080/socket')

    let remoteRTCMessage = useRef<string | null>(null)

    // stacking up messages
    useEffect(() => {
        console.log("in useEffect:  messages = ")
        console.log(messages)
        if (messages.current.length === 0) {
            messages.current = ([
                {
                    purpose: "introduction",
                    message:
                        "Hi there.  Welcome to the VA Assistant.  How can I help you?",
                    sender: "bot"
                }
            ]);
            setUpdateState(Math.random())
        } else {
            console.log("Else clause")
            console.log(sendUserResponse)
            let tempArray = [...messages.current];
            if (typeof sendUserResponse === 'string') {
                tempArray.push({message: sendUserResponse, sender: "user"});
            } else {
                tempArray.push(sendUserResponse)
            }
            console.log("tempArray=")
            console.log(tempArray)
            messages.current = tempArray;
            setUpdateState(Math.random())

            setTimeout(() => {
                let temp2 = [...tempArray];
                // temp2.push(botResponse);
                // messages.current = temp2;
            }, 1000);
        }
    }, [sendUserResponse]);


    var done = false;

    function delay(ms: number): Promise<typeof setTimeout> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function checkNewMessage(): Promise {
        for (var i = 0; i < 3000 && !done; i++) {
            await delay(1000);
            var newMessage: string | null = getNewMessage();
            if (newMessage != null) {
                console.log("checkNewMessage:  setting message to " + newMessage);
                setSendUserResponse({message: newMessage, sender: "callcenter"})
            }
        }
    };

    useEffect(() => {
        var thread = checkNewMessage();
    }, []);

    socket.addEventListener("open", () => {
        console.log("web Socket got connected!!!!");
        console.log(type)
        if (type === "OUTGOING_CALL") {
            socket.send(JSON.stringify({
                    message: "makeCall",
                    type: "CLIENT",
                    calleeId: destCallerId,
                    currentScreen: t('claimDetails.title'),
                    sdpOffer: "Offer",
                    email: email,
                    branch: branch,
                    name: fullName,
                    service: service,
                    claimId: claimId,
                    claimType: claimType,
                    claimPhase: claimPhase,
                    claims: claims,
                    callCenterPhone: callCenterPhone,
                    room: "10",
                    rtcMessage: "An rtcMessage",
                })
            );
        }
    })

    const getCallScreen = (type: string, messages?: MessagesInfo[]) => {
        switch (type) {
            case 'CALL_CLAIM_DETAILS':
                return CallClaimDetailsScreen({
                    type: type,
                    setType: setType,
                    sourceCallerId,
                    destCallerId,
                    socket,
                    remoteRTCMessage,
                    claimId: claimId,
                    claimType: claimType,
                    claimPhase: claimPhase,
                    claims: claims,
                    callCenterPhone: callCenterPhone,
                    screen: t('claimDetails.title'),
                });
                break;
            case 'JOIN':
                return JoinScreen({
                    type: type,
                    setType: setType,
                    sourceCallerId,
                    destCallerId,
                    socket,
                    remoteRTCMessage
                });
            case 'OUTGOING_CALL':
                return OutgoingCallScreen({type, setType, sourceCallerId, destCallerId, socket, remoteRTCMessage});
            case 'ACCEPTED_CALL':
                return AcceptedCallScreen({
                    type,
                    setType,
                    sourceCallerId,
                    destCallerId,
                    socket,
                    remoteRTCMessage,
                    localStream: localMediaStream,
                    setLocalStream: setLocalMediaStream,
                    sendUserResponse,
                    setSendUserResponse,
                    messages
                })
            default:
                return null;
        }
    }


    const text = t('claimDetails.placeCall.calling')

    console.log("Before render:   messages=")
    console.log(messages.current)
    return (
        <LargePanel title={t('claimDetails.placeCall.pageTitle')} rightButtonText={t('close')}>
            {/*<Box mb={theme.dimensions.contentMarginBottom} mx={theme.dimensions.gutter}>*/}
            {/*    /!*<TextView key={"1"} variant="MobileBodyBold" accessibilityRole="header"*!/*/}
                {/*          accessibilityLabel={a11yLabelVA(t('claimDetails.placeCall.calling'))}>*/}
                {/*    {t('claimDetails.placeCall.calling')}*/}
                {/*</TextView>*/}
                {/*<TextView key={"2"} variant="MobileBody" paragraphSpacing={true}>*/}
                {/*    {t('claimDetails.placeCall.calling.content')}*/}
                {/*</TextView>*/}
                {/*<TextView*/}
                {/*    key={"3"}*/}
                {/*    variant="MobileBodyLink"*/}
                {/*    accessibilityRole="link"*/}
                {/*    {...a11yHintProp(`${text} ${t('mobileBodyLink.a11yHint')}`)}*/}
                {/*    onPress={onDecisionReview}*/}
                {/*    testID="ClaimsDecisionReviewOptionsTestID">*/}
                {/*    {text}*/}
                {/*</TextView>*/}
            {/*</Box>*/}
            {getCallScreen(type, messages.current)}
        </LargePanel>
    )
}

export default PlaceCall
