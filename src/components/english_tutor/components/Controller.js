import React, { useState, useEffect } from "react";
import { View, Pressable, StatusBar, Image } from "react-native";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
import uuid from "react-native-uuid";
import { getAuth } from "firebase/auth";

import {
    orgMicroButtonGradientStyle,
    onHoldMicroButtonGradientStyle,
} from "../../../styles/Styles";

import useReactNativeVoice from "./hooks/useReactNativeVoice";
import useExpoAV from "./hooks/useExpoAV";
import fetchAudioFromServer from "../apis/fetchAudioFromServer";
import fetchTextFromServer from "../apis/fetchTextFromServer";
import handleResetConversation from "../apis/resetConversation";
import saveAudioToFile from "../apis/utils/saveAudioToFile";
import playAudiofromAudioPath from "../apis/utils/playAudiofromAudioPath";
import combineArrays from "../apis/utils/combineArrays";
import HomeButton from "../../authentication/HomeButton";
import ResetButton from "./ResetButton";
import ConversationArea from "./ConversationArea";
import BackgroundImage from "../../../../assets/english_tutor/EnglishTutorBackgroundImage.png";
import { PromptTextWhenWrong } from "../../../logistics/Logistics";

// set some configurations for the audio
Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true, // very important
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
});

const orgMicroButtonGradient = orgMicroButtonGradientStyle;
const onHoldMicroButtonGradient = onHoldMicroButtonGradientStyle;

export default function Controller() {
    // arrangement for the onRecording state before handle recording, STT, etc.
    const [onRecording, setOnRecording] = useState(false);

    // arrangement for making the loading dots (i.e., while loading ... )
    const [isLoading, setIsLoading] = useState(false);

    // arrangement for using user UID
    const [userUID, setUserUID] = useState(null);

    // arrangement for making combinedMessages (i.e., combining user and ai messages)
    const [userMessages, setUserMessages] = useState([]);
    const [aiMessages, setAiMessages] = useState([]);

    // arrangement for using react-native-voice custom hook
    const { state, startSpeechToText, stopSpeechToText, destroySpeechToText } =
        useReactNativeVoice();

    // arrangement for using expo-av custom hook
    const { recording, audioUri, startRecording, stopRecording } = useExpoAV();

    // arrangement for using userUID
    useEffect(() => {
        const auth = getAuth();
        setUserUID(auth.currentUser.uid);
    }, []);

    useEffect(() => {
        const reset = async () => {
            await handleResetConversation();
        };
        reset();
    }, []);

    const handleController = async () => {
        let text = "";

        if (!state.results[0]) {
            // Immediately stop recording and cleanup if there are no speech results
            if (recording) {
                await stopRecording(); // Ensure the recording is stopped if it was started.

                text = PromptTextWhenWrong;
            }
        } else {
            text = state.results[0];
        }

        try {
            setOnRecording(true);
            setIsLoading(true);

            // fetch audio blob response from the server
            const audioBlob = await fetchAudioFromServer(text);

            const fileReader = new FileReader();
            fileReader.onload = async (event) => {
                if (event.target && typeof event.target.result === "string") {
                    //  [data:audio/mpeg; base64 , ... (actual base64 data) ...]
                    const audioData = event.target.result.split(",")[1];

                    // save the audioData
                    const audioPath = await saveAudioToFile(audioData);

                    setIsLoading(false);

                    // play the audioData
                    await playAudiofromAudioPath(audioPath);

                    if (text === PromptTextWhenWrong) {
                        console.log("nothing for speech to text");
                    } else {
                        const audioUri = await stopRecording();

                        // fetch text response from the server
                        const { text: ai_text } = await fetchTextFromServer();

                        const date = new Date().toISOString().split("T")[0];
                        const time = new Date();

                        const messageID = uuid.v4();

                        setUserMessages((currentMessage) => [
                            ...currentMessage,
                            {
                                audioPath: audioUri,
                                ID: messageID,
                                source: "user",
                                time: time,
                                date: date,
                                text: state.results[0],
                                userUID: userUID,
                            },
                        ]);

                        setAiMessages((currentMessage) => [
                            ...currentMessage,
                            {
                                audioPath: audioPath,
                                ID: messageID,
                                source: "ai",
                                time: time,
                                date: date,
                                text: ai_text,
                                userUID: userUID,
                            },
                        ]);

                        // destroy the SpeechToText engine
                        destroySpeechToText();
                        setOnRecording(false);
                    }
                }
            };

            fileReader.readAsDataURL(audioBlob);
        } catch (error) {
            console.error("error at handleController: ", error.message);
        }
    };

    const combinedMessages = combineArrays(userMessages, aiMessages);

    const handleResetButton = async () => {
        const response = await handleResetConversation();
        if (response && response.status === 200) {
            setUserMessages([]);
            setAiMessages([]);
        } else {
            console.error("Resetting error");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Image
                source={BackgroundImage}
                resizeMode="cover"
                style={{ height: "100%", width: "100%", position: "absolute" }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
                {/* Conversation area frame */}
                <ConversationArea
                    combinedMessages={combinedMessages}
                    isLoading={isLoading}
                />

                {/* Controller buttons container */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        position: "absolute",
                        bottom: 25,
                        width: "100%",
                        paddingHorizontal: 20,
                    }}
                >
                    {/* Buttons */}
                    {/* Home button */}
                    <HomeButton />

                    {/* Record button */}
                    <Pressable
                        onPressIn={() => {
                            startSpeechToText();
                            startRecording();
                            setOnRecording(true);
                        }}
                        onPressOut={async () => {
                            stopSpeechToText();
                            await handleController();
                            setOnRecording(false);
                        }}
                        style={{
                            width: 160,
                            height: 120,
                            borderRadius: 45,
                            padding: 20,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={
                                onRecording
                                    ? onHoldMicroButtonGradient
                                    : orgMicroButtonGradient
                            }
                            style={{
                                borderRadius: 45,
                                width: "100%",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FontAwesome5
                                name="microphone"
                                size={34}
                                color={onRecording ? "#08203e" : "#fff"}
                            />
                        </LinearGradient>
                    </Pressable>

                    {/* Reset button */}
                    <ResetButton onReset={handleResetButton} />
                </View>
            </View>
        </View>
    );
}
