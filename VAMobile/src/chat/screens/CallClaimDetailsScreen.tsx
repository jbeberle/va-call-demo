import React, {useState, useEffect} from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {MessagesInfo} from "./ChatScreen";
import {Box, TextView, VAModalPicker} from "../../components";
import {a11yLabelVA} from "../../utils/a11yLabel";
import {useTranslation} from 'react-i18next'
import {NAMESPACE} from "../../constants/namespaces";
import {testIdProps} from "../../utils/accessibility";
import theme from "../../styles/themes/standardTheme";
import {
    ClaimAndAppealData,
    ClaimOrAppeal,
    ClaimOrAppealConstants, contentTypes,
    ContentTypes,
    Params,
    ScreenIDTypesConstants
} from "../../store/api";
import * as api from "../communication/api";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import {ClaimsAndAppealsState, getClaimsAndAppeals, MilitaryServiceState} from "../../store/slices";
import {useAuthorizedServices} from "../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../api/personalInformation/getPersonalInformation";
import {
    ClaimTypeConstants
} from "../../screens/BenefitsScreen/ClaimsScreen/ClaimsAndAppealsListView/ClaimsAndAppealsListView";
import {useAppDispatch, useExternalLink} from "../../utils/hooks";
import {capitalizeWord, formatDateMMMMDDYYYY} from "../../utils/formattingUtils";


export type CallScreenPropType = {
    type: string,
    setType: (type: string) => void;
    sourceCallerId: string
    destCallerId: string
    socket: WebSocket
    remoteRTCMessage: React.MutableRefObject<null>;
    sendUserResponse?: string
    setSendUserResponse?: (string) => void
    messages?: MessagesInfo[];
    screen?: string
}

export type PickerType = {
    label: string
    value: string
}


const callReasonList: PickerType[] = [
    {label: 'Claim Status', value: '1'},
    {label: 'Questions about Disability claims compenstaion', value: '2'},
    {label: 'Something Else', value: '3'},
];

export const CallClaimDetailsScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    const callerId: string = props.sourceCallerId
    const otherUserId: string = props.destCallerId
    const screen: string = props.screen;
    const {claimId, claimType, claimProps, claims, callCenterPhone} = props;
    let socket = props.socket
    const [callReason, setCallReason] = useState(callReasonList[0].label);
    const [callReasonFocus, setCallReasonFocus] = useState<boolean>(false);
    const [claim, setClaim] = useState(null);
    const [claimFocus, setClaimFocus] = useState<boolean>(false);
    const [callReasonOption, setCallReasonOption] = useState<PickerType>(callReasonList[0])
    const {t} = useTranslation(NAMESPACE.COMMON)

    const getBoldTextDisplayed = (type: ClaimOrAppeal, displayTitle: string, updatedAtDate: string): string => {
        const formattedUpdatedAtDate = formatDateMMMMDDYYYY(updatedAtDate)


        switch (type) {
            case ClaimOrAppealConstants.claim:
                console.log(displayTitle)
                console.log(formattedUpdatedAtDate)
                console.log(t('claims.claimFor', { displayTitle: displayTitle?.toLowerCase(), date: formattedUpdatedAtDate }))
                return t('claims.claimFor', { displayTitle: displayTitle?.toLowerCase(), date: formattedUpdatedAtDate })
            case ClaimOrAppealConstants.appeal:
                return t('claims.appealFor', { displayTitle: capitalizeWord(displayTitle), date: formattedUpdatedAtDate })
        }

        return ''
    }


    const [claimList, setClaimList] = useState<PickerType[]>([]);
    console.log("claims=")
    let newClaimList = [];
    claims.forEach((claim: any) => {console.log(claim.attributes); console.log(claim.type); newClaimList = [... newClaimList, {label: getBoldTextDisplayed(claim.type, claim.attributes.displayTitle, claim.attributes.updatedAt), value:"1"}]})
    const [claimOption, setClaimOption] = useState<PickerType>(newClaimList[0])
    const {mostRecentBranch, serviceHistory} = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const {data: userAuthorizedServices} = useAuthorizedServices()
    const {data: personalInfo} = usePersonalInformation()
    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''
    const launchExternalLink = useExternalLink()

    useEffect(() => {
        setClaimList(newClaimList)
        setClaim(newClaimList[0].label)
    }, []);


    const items = [{content: <TextView>One</TextView>}, {content: <TextView>Two</TextView>}]

    const setValuesOnCallReasonSelect = (selectValue: string): void => {
        const curSelectedRange = callReasonList.find((el) => el.value === selectValue)
        if (curSelectedRange) {
            setCallReasonOption(curSelectedRange)
            setCallReason(curSelectedRange.label)
        }
    }

    const setValuesOnClaimSelect = (selectValue: string): void => {
        const curSelectedRange = claimList.find((el) => el.value === selectValue)
        if (curSelectedRange) {
            setClaimOption(curSelectedRange)
            setClaim(curSelectedRange.label)
        }
    }


    function callButtonPressed() {
        // setType('OUTGOING_CALL');
        console.log(`Sending:`)
        console.log(`fullName=${fullName}`)
        console.log(`email=${email}`)
        console.log(`service=${service}`)
        console.log(`branch=${branch}`)
        console.log(`screen=${screen}`)
        console.log(`claimId=${claimId}`)
        console.log(`claimType=${claimType}`)
        console.log(`claimProps=${claimProps}`)
        console.log("claims=...")
        console.log(claims)
        api.post('/vetcall', {
            fullName,
            email,
            service,
            branch,
            screen,
            callReason,
            callClaimDescription: claim,
            claimId,
            claimType,
            claimProps
        } as Params,
            contentTypes.applicationJson
            )
        console.log(`launchExternalLink=${launchExternalLink}`)
        console.log(`callCenterPhone=${callCenterPhone}`)
        console.log(`callReason=${callReason}`)
        console.log(`callClaimDescription=${claim}`)
        launchExternalLink(callCenterPhone)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
                flex: 1,
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                paddingHorizontal: 42,
            }}>

            <TextView key={"1"} variant="MobileBody" accessibilityRole="header"
                      accessibilityLabel={a11yLabelVA(t('claimDetails.placeCall.calling'))}>
                {t('claimDetails.placeCall.subTitle')}
            </TextView>
            <Box mx={theme.dimensions.gutter}
                 mb={theme.dimensions.standardMarginBetween} {...testIdProps(t('upcomingAppointments.confirmedApptsDisplayed'))}
                 accessible={true}>
            </Box>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <View>
                        <VAModalPicker
                            onSelectionChange={setValuesOnCallReasonSelect}
                            pickerOptions={callReasonList}
                            labelKey={'claimDetails.placeCall.callReasonLabel'}
                            selectedValue={callReasonOption.value}/>
                    </View>

                    <TextView key={"4"} variant="MobileBodyTight" accessibilityRole="header"
                              accessibilityLabel={a11yLabelVA("   ")}>
                        {"   "}
                    </TextView>

                    {callReason !== "Something Else" ?
                        <View>
                            <VAModalPicker
                                onSelectionChange={setValuesOnClaimSelect}
                                pickerOptions={claimList}
                                labelKey={'claimDetails.placeCall.claimLabel'}
                                selectedValue={claimOption.value}/>
                        </View>
                        : <></>}


                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 12,
                            alignItems: 'center',
                        }}>
                    </View>

                    <View
                        style={{
                            backgroundColor: '#f0f0f0',
                            padding: 40,
                            marginTop: 25,
                            justifyContent: 'center',
                            borderRadius: 14,
                        }}>
                        <TouchableOpacity
                            onPress={() => {
                                callButtonPressed()
                            }}
                            style={{
                                height: 50,
                                backgroundColor: '#5568FE',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 12,
                                marginTop: 16,
                            }}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#FFFFFF',
                                }}>
                                {t('claimDetails.placeCall.callButtonLabel')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};