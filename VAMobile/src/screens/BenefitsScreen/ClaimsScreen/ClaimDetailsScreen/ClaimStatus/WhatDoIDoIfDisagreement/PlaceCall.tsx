import { StackScreenProps } from '@react-navigation/stack/lib/typescript/src/types'
import { useTranslation } from 'react-i18next'
import React, { FC } from 'react'

import { BenefitsStackParamList } from 'screens/BenefitsScreen/BenefitsStackScreens'
import { Box, LargePanel, TextView } from 'components'
import { NAMESPACE } from 'constants/namespaces'
import { a11yHintProp } from 'utils/accessibility'
import { a11yLabelVA } from 'utils/a11yLabel'
import { useExternalLink, useTheme } from 'utils/hooks'
import getEnv from 'utils/env'


const { LINK_URL_DECISION_REVIEWS } = getEnv()

type PlaceCallProps = StackScreenProps<BenefitsStackParamList, 'PlaceCall'>

const PlaceCall: FC<PlaceCallProps> = ({ route }) => {
    const { t } = useTranslation(NAMESPACE.COMMON)
    const theme = useTheme()
    const { claimID, claimType, claimStep } = route.params

    const onDecisionReview = async (): Promise<void> => {
        //launchExternalLink(LINK_URL_DECISION_REVIEWS, { claim_id: claimID, claim_type: claimType, claim_step: claimStep })
    }

    console.log("Hi!")
    const websocket = new WebSocket('ws://10.0.0.242:8080/socket')
    console.log("connected to websocket")
    console.log(websocket)
    // websocket.onopen(() => console.log("web Socket got connected!!!!"))
    websocket.addEventListener("open", () => console.log("web Socket got connected!!!!"))
    websocket.addEventListener("message", (message) => console.log("web Socket got a message!!!!"))
    websocket.addEventListener("close", () => console.log("web Socket got closed!!!!"))
    websocket.addEventListener("error", (err) => {
       console.log("web Socket got an error!!!!");
       console.log(err);
       });



    const text = t('claimDetails.placeCall.calling')

    return (
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
        </LargePanel>
    )
}

export default PlaceCall
