import {StackScreenProps} from '@react-navigation/stack/lib/typescript/src/types'
import {useTranslation} from 'react-i18next'
import React, {FC, useState} from 'react'

import {BenefitsStackParamList} from 'screens/BenefitsScreen/BenefitsStackScreens'
import {LargePanel} from 'components'
import {NAMESPACE} from 'constants/namespaces'
import {useRouteNavigation, useTheme} from 'utils/hooks'
import {useSelector} from "react-redux";
import {RootState} from "../../../../../../store";
import {MilitaryServiceState} from "../../../../../../store/slices";
import {useAuthorizedServices} from "../../../../../../api/authorizedServices/getAuthorizedServices";
import {usePersonalInformation} from "../../../../../../api/personalInformation/getPersonalInformation";
import {CallClaimDetailsScreen} from "../../../../../../callcenter/screens/CallClaimDetailsScreen";

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

    const {mostRecentBranch, serviceHistory} = useSelector<RootState, MilitaryServiceState>((s) => s.militaryService)
    const {data: userAuthorizedServices} = useAuthorizedServices()
    const {data: personalInfo} = usePersonalInformation()
    const accessToMilitaryInfo = userAuthorizedServices?.militaryServiceHistory && serviceHistory.length > 0
    const navigateTo = useRouteNavigation()

    const fullName = personalInfo?.fullName
    const email = personalInfo?.signinEmail
    const service = personalInfo?.signinService
    const branch = mostRecentBranch || ''

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

    return (
        <LargePanel title={t('claimDetails.placeCall.pageTitle')} rightButtonText={t('close')}>
            {getCallScreen(type)}
        </LargePanel>
    )
}

export default PlaceCall
