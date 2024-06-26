import { View, Text, Pressable } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import React from "react";
import { Fontisto } from "@expo/vector-icons";
import { AuthButton1Style } from "../../../styles/Styles";

const buttonGradient = ["#0b3866", "#4b749f"];

export default function ResetButton({ onReset }) {
    return (
        <View>
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={buttonGradient}
                style={{ ...AuthButton1Style }}
            >
                <Pressable
                    onPress={() => onReset()}
                    style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row", // Change here: Set flexDirection to row
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: pressed ? 0.5 : 1,
                    })}
                >
                    <Text
                        style={{
                            marginRight: 10,
                            color: "white",
                        }}
                    >
                        Reset
                    </Text>
                    <Fontisto name="redo" size={24} color="white" />
                </Pressable>
            </LinearGradient>
        </View>
    );
}
