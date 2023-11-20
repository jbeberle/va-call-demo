import React, {useState} from 'react';
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
import {ContentTypes, Params} from "../../store/api";
import * as api from "../communication/api";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import {MilitaryServiceState} from "../../store/slices";
import {useAuthorizedServices} from "../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../api/personalInformation/getPersonalInformation";


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

const claimList: PickerType[] = [
    {label: 'Claim for Compensation updated on July 20, 2021', value: '1'},
    {label: 'Claim for Dependendency update on May 05, 2021', value: '2'},
];

export const CallClaimDetailsScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    const setType: (type: string) => void = props.setType
    const callerId: string = props.sourceCallerId
    const otherUserId: string = props.destCallerId
    const {claimId, claimType, claimProps} = props;
    let socket = props.socket
    const [callReason, setCallReason] = useState(null);
    const [callReasonFocus, setCallReasonFocus] = useState<boolean>(false);
    const [claim, setClaim] = useState(null);
    const [claimFocus, setClaimFocus] = useState<boolean>(false);
    const [callReasonOption, setCallReasonOption] = useState<PickerType>(callReasonList[0])
    const [claimOption, setClaimOption] = useState<PickerType>(claimList[0])
    const {t} = useTranslation(NAMESPACE.COMMON)
    const {mostRecentBranch, serviceHistory} = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const {data: userAuthorizedServices} = useAuthorizedServices()
    const {data: personalInfo} = usePersonalInformation()
    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''

    // const events: Array<ClaimEventData> = [{data:"Claim 1", type:'statuatory_opt_in'}, {data:"Claim 2", type:'hlr_other_close'}]


    const items = [{content: <TextView>One</TextView>}, {content: <TextView>Two</TextView>}]

    const setValuesOnCallReasonSelect = (selectValue: string): void => {
        const curSelectedRange = callReasonList.find((el) => el.value === selectValue)
        if (curSelectedRange) {
            setCallReasonOption(curSelectedRange)
            setCallReason(curSelectedRange.label)
            // getAppointmentsInSelectedRange(curSelectedRange, 1)
        }
    }

    const setValuesOnClaimSelect = (selectValue: string): void => {
        const curSelectedRange = claimList.find((el) => el.value === selectValue)
        if (curSelectedRange) {
            setClaimOption(curSelectedRange)
            setClaim(curSelectedRange.label)
            // getAppointmentsInSelectedRange(curSelectedRange, 1)
        }
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
                                setType('OUTGOING_CALL');
                                // api.post('/vetcall', {
                                //     fullName,
                                //     email,
                                //     service,
                                //     branch,
                                //     claimId,
                                //     claimType,
                                //     claimProps
                                // } as Params)
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