import {CallScreenPropType} from "./JoinScreen";
import {Text, View} from "react-native";

export const AcceptedCallScreen = (props: CallScreenPropType) => {
    const type: string = props.type
    return (
        <>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'space-around',
                    backgroundColor: '#050A0E',
                }}>
                <View
                    style={{
                        padding: 35,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 14,
                    }}>
                    <Text
                        style={{
                            fontSize: 24,
                            marginTop: 12,
                            color: '#ffff',
                            letterSpacing: 6,
                        }}>
                    Call Accepted.   Please wait...
                    </Text>
                </View>
            </View>
        </>
    )
}