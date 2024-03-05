import {
    View,
    Text,
    Image,
    StatusBar,
    TextInput,
    TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";

import BackgroundImage from "../../../assets/homeImage.png";
import {
    AuthFormFormat,
    AuthButtonStyle,
    TextGlowingEffect,
    AuthTitleStyle,
    fontFamilyStyle,
} from "../../styles/Styles";
import HeaderPanel from "../../screens/HeaderPanel";
import ToSigninButton from "./ToSigninButton";

export default function ResetPassword() {
    const navigation = useNavigation();

    const [email, setEmail] = useState("");

    const handleResetPassword = async () => {
        if (email) {
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Password reset email sent!");
                navigation.navigate("Welcome");
            } catch (error) {
                console.log("error when resetting password: ", error.message);
            }
        } else {
            alert("It's required to enter: Email");
        }
    };

    return (
        <View style={{ height: "100%", width: "100%" }}>
            <StatusBar style="light" />
            <Image
                source={BackgroundImage}
                resizeMode="cover"
                style={{ height: "100%", width: "100%", position: "absolute" }}
            />

            <View style={{ marginTop: hp(20), marginBottom: 25 }}>
                <HeaderPanel />
            </View>

            <View style={{ alignItems: "center", marginBottom: hp(35) }}>
                {/* Reset Title */}
                <View style={{ marginBottom: 30 }}>
                    <Text style={{ ...AuthTitleStyle, ...TextGlowingEffect }}>
                        Reset
                    </Text>
                </View>

                {/* Email */}
                <View style={{ ...AuthFormFormat, marginBottom: 15 }}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={"grey"}
                        style={{ height: "100%" }}
                        value={email}
                        onChangeText={(value) => setEmail(value)}
                    />
                </View>
                <View style={{ marginBottom: 15 }}>
                    {/* Request Reset Password Button */}
                    <TouchableOpacity
                        onPress={handleResetPassword}
                        style={{
                            ...AuthButtonStyle,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamilyStyle,
                                fontSize: 20,
                                color: "white",
                                ...TextGlowingEffect,
                            }}
                        >
                            tap to reset
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text
                        style={{
                            fontFamily: fontFamilyStyle,
                            fontSize: 16,
                            color: "white",
                            ...TextGlowingEffect,
                        }}
                    >
                        or
                    </Text>
                </View>

                <ToSigninButton text={"return to sign in"} />
            </View>
        </View>
    );
}
