import {StackScreenProps} from '@react-navigation/stack/lib/typescript/src/types'
import {useTranslation} from 'react-i18next'
import React, {FC, useState} from 'react'

import {BenefitsStackParamList} from 'screens/BenefitsScreen/BenefitsStackScreens'
import {LargePanel, TextView} from 'components'
import {NAMESPACE} from 'constants/namespaces'
import {useExternalLink, useRouteNavigation, useTheme} from 'utils/hooks'
import {useSelector} from "react-redux";
import {RootState} from "../../../../../../store";
import {MilitaryServiceState} from "../../../../../../store/slices";
import {useAuthorizedServices} from "../../../../../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../../../../../api/personalInformation/getPersonalInformation";
import {CallClaimDetailsScreen} from "../../../../../../callcenter/screens/CallClaimDetailsScreen";
import * as api from "../../../../../../callcenter/communication/api";
import {contentTypes, Params} from "../../../../../../store/api";
import {Text, TouchableOpacity, View} from "react-native";
import {a11yLabelVA} from "../../../../../../utils/a11yLabel";

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
    const [type, setType] = useState('CALL_CLAIM_DETAILS');
    const launchExternalLink = useExternalLink()
    const claimFound = claims.filter((claim: any) => claim.id === claimId)

    const {mostRecentBranch, serviceHistory} = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const {data: userAuthorizedServices} = useAuthorizedServices()
    const {data: personalInfo} = usePersonalInformation()
    const accessToMilitaryInfo = userAuthorizedServices?.militaryServiceHistory && serviceHistory.length > 0
    const navigateTo = useRouteNavigation()

    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''

    function callButtonPressed() {
        api.post('/vetcall', {
                fullName,
                email,
                service,
                branch,
                screen: t('claimDetails.title'),
                callReason: 'Claim Status',
                callClaimDescription: claimFound?.attributes?.displayTitle,
                claimId,
                claimType,
                claimPhase
            } as Params,
            contentTypes.applicationJson
        )
        launchExternalLink(callCenterPhone)
    }

    const getCallScreen = (type: string) => {
        switch (type) {
            case 'CALL_CLAIM_DETAILS':
                return CallClaimDetailsScreen({
                    type: type,
                    setType: setType,
                    claimId: claimId,
                    claimType: claimType,
                    claimPhase: claimPhase,
                    claims: claims,
                    callCenterPhone: callCenterPhone,
                    screen: t('claimDetails.title'),
                });
                break;
            default:
                return null;
        }
    }


    const text = t('claimDetails.placeCall.calling')

    callButtonPressed();

    return (
        <>
        <LargePanel title={t('claimDetails.placeCall.pageTitle')} rightButtonText={t('close')}>
            <TextView key={"1"} variant="MobileBody" accessibilityRole="header"
                      accessibilityLabel={a11yLabelVA(t('claimDetails.placeCall.calling'))}>
                {t('claimDetails.placeCall.pleaseWait')}
            </TextView>
            <View
                style={{
                    backgroundColor: '#f0f0f0',
                    padding: 40,
                    marginTop: 25,
                    justifyContent: 'center',
                    borderRadius: 14,
                }}>
                {/*<TouchableOpacity*/}
                {/*    onPress={() => {*/}
                {/*        callButtonPressed()*/}
                {/*    }}*/}
                {/*    style={{*/}
                {/*        height: 50,*/}
                {/*        backgroundColor: '#5568FE',*/}
                {/*        justifyContent: 'center',*/}
                {/*        alignItems: 'center',*/}
                {/*        borderRadius: 12,*/}
                {/*        marginTop: 16,*/}
                {/*    }}>*/}
                {/*    <Text*/}
                {/*        style={{*/}
                {/*            fontSize: 16,*/}
                {/*            color: '#FFFFFF',*/}
                {/*        }}>*/}
                {/*        {t('claimDetails.placeCall.callButtonLabel')}*/}
                {/*    </Text>*/}
                {/*</TouchableOpacity>*/}
            </View>
        </LargePanel>
        </>
    )
}

export default PlaceCall
