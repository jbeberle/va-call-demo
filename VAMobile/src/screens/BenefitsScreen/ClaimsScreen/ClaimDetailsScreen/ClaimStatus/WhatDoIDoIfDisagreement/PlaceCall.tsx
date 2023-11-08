import { StackScreenProps } from '@react-navigation/stack/lib/typescript/src/types'
import { useTranslation } from 'react-i18next'
import React, {FC, useEffect, useState} from 'react'

import { BenefitsStackParamList } from 'screens/BenefitsScreen/BenefitsStackScreens'
import { Box, LargePanel, TextView } from 'components'
import { NAMESPACE } from 'constants/namespaces'
import { a11yHintProp } from 'utils/accessibility'
import { a11yLabelVA } from 'utils/a11yLabel'
import {useExternalLink, useRouteNavigation, useTheme} from 'utils/hooks'
import getEnv from 'utils/env'
import {JoinScreen} from "../../../../../../webrtc/JoinScreen";
import {IncomingCallScreen} from "../../../../../../webrtc/IncomingCallScreen";
import {OutgoingCallScreen} from "../../../../../../webrtc/OutgoingCallScreen";
import {CallContext} from "../CallContext/CallContext";
import {RTCPeerConnection} from "react-native-webrtc";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../../store";
import {MilitaryServiceState} from "../../../../../../store/slices";
import {useAuthorizedServices} from "../../../../../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../../../../../api/personalInformation/getPersonalInformation";
import {AcceptedCallScreen} from "../../../../../../webrtc/AcceptedCallScreen";


const { LINK_URL_DECISION_REVIEWS } = getEnv()

type PlaceCallProps = StackScreenProps<BenefitsStackParamList, 'PlaceCall'>

const PlaceCall: FC<PlaceCallProps> = ({ route }) => {
    const { t } = useTranslation(NAMESPACE.COMMON)
    const theme = useTheme()
    const { claimId, claimType, claimPhase } = route.params
    console.log(`route=`)
    console.log(route)
    const [type, setType] = useState('JOIN');
    let sourceCallerId = "1"
    let destCallerId = "800-827-1000";
    let room="10";
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

    const { mostRecentBranch, serviceHistory } = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const { data: userAuthorizedServices } = useAuthorizedServices()
    const { data: personalInfo } = usePersonalInformation()
    const accessToMilitaryInfo = userAuthorizedServices?.militaryServiceHistory && serviceHistory.length > 0
    const navigateTo = useRouteNavigation()

    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''

    const onDecisionReview = async (): Promise<void> => {
        //launchExternalLink(LINK_URL_DECISION_REVIEWS, { claim_id: claimId, claim_type: claimType, claim_step: claimPhase })
    }

    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(new RTCPeerConnection(iceConfiguration));
    const socket = new WebSocket('ws://10.0.0.242:8080/socket')

    socket.addEventListener("open", () => {
        console.log("web Socket got connected!!!!");
        console.log(type)
        if(type === "OUTGOING_CALL") {
            socket.send(JSON.stringify({
                    "message": "makeCall",
                    "type": "CLIENT",
                    "calleeId": destCallerId,
                    "currentScreen": t('claimDetails.title'),
                    "sdpOffer": "Offer",
                    "email": email,
                    "branch": branch,
                    "name": fullName,
                    "service": service,
                    "claimId": claimId,
                    "claimType": claimType,
                    "claimPhase": claimPhase,
                    "room": "10"
                })
            );
        }

    })

     const getCallScreen = (type: string) => {
         switch (type) {
             case 'JOIN':
                 return JoinScreen({type: type, setType: setType, sourceCallerId, destCallerId, socket, peerConnection, setPeerConnection});
             case 'INCOMING_CALL':
                 return IncomingCallScreen({type, setType, sourceCallerId, destCallerId, socket, peerConnection, setPeerConnection});
             case 'OUTGOING_CALL':
                 return OutgoingCallScreen({type, setType, sourceCallerId, destCallerId, socket, peerConnection, setPeerConnection});
             case 'ACCEPTED_CALL':
                 return AcceptedCallScreen ({type, setType, sourceCallerId, destCallerId, socket, peerConnection, setPeerConnection})
             default:
                 return null;
         }
     }



    const text = t('claimDetails.placeCall.calling')

    return (
        <CallContext.Provider
            value={{
                peerConnection,
                setPeerConnection
            }}
        >
        <LargePanel title={t('claimDetails.placeCall.pageTitle')} rightButtonText={t('close')}>
            <Box mb={theme.dimensions.contentMarginBottom} mx={theme.dimensions.gutter}>
                <TextView variant="MobileBodyBold" accessibilityRole="header" accessibilityLabel={a11yLabelVA(t('claimDetails.placeCall.calling'))}>
                    {t('claimDetails.placeCall.calling')}
                </TextView>
                <TextView variant="MobileBody" paragraphSpacing={true}>
                    {t('claimDetails.placeCall.calling.content')}
                </TextView>
                <TextView
                    variant="MobileBodyLink"
                    accessibilityRole="link"
                    {...a11yHintProp(`${text} ${t('mobileBodyLink.a11yHint')}`)}
                    onPress={onDecisionReview}
                    testID="ClaimsDecisionReviewOptionsTestID">
                    {text}
                </TextView>
            </Box>
           {getCallScreen(type)}
        </LargePanel>
        </CallContext.Provider>
    )
}

export default PlaceCall
