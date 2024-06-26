import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    ScrollView,
    Pressable,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Wander } from "react-native-animated-spinkit";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { auth } from "../../../../Firebase/firebase";
import fetchDataFromFirestore from "../apis/fetchDataFromFirestore";
import fetchDeleteMessagesFromServer from "../apis/fetchDeleteMessagesFromServer";
import combineArrays from "../apis/utils/combineArrays";
import togglePlayPause from "../apis/utils/togglePlayPause";
import toggleChosenMessageID from "../apis/utils/toggleChosenMessageID";
import playAudiofromAudioPath from "../apis/utils/playAudiofromAudioPath";

import SpeechBubbleForRecords from "./SpeechBubbleForRecords";
import HomeButton from "../../authentication/HomeButton";
import LoadDataButton from "./LoadDataButton";
import GoBackOneStepButton from "../../../navigation/GobackOneStepButton";
import HelloUserCard from "../../authentication/HelloUserCard";
import BackgroundImage from "../../../../assets/talkative_agent/TalkativeAgentConversationRecordImage1.png";
import {
    ConversationAreaFrameForRecordsStyle,
    AuthFormFormat,
} from "../../../styles/Styles";
import { TextStyles } from "../../../styles/FontStyles";

const SERVICE_NAME = "TalkativeAgent";

export default function TalkativeAgentConversationRecords() {
    const [isLoading, setIsLoading] = useState(false);
    const [onPlayingAudio, setOnPlayingAudio] = useState({
        audioPath: null,
        isPlaying: false,
    });

    // Arrangement for authentication
    const [userName, setUserName] = useState("");
    const [userUID, setUserUID] = useState(null);

    // Arrangement for loading Messages from server
    const [userMessages, setUserMessages] = useState([]);
    const [aiMessages, setAiMessages] = useState([]);

    // Arrange chosenMessageIDs and chosenMessages states
    const [chosenMessageIDs, setChosenMessageIDs] = useState([]);
    const [chosenMessages, setChosenMessages] = useState([]);

    // load the messages from the server when the component mounts
    useEffect(() => {
        // Once the userUID is available, fetch the data
        if (userUID) {
            handleFetchData();
        }
    }, [userUID]);

    // Update the chosenMessages according to chosenMessageIDs
    useEffect(() => {
        // Filter combinedMessages for messages whose ID is in chosenMessageIDs
        const filteredMessages = combinedMessages.filter((message) =>
            chosenMessageIDs.includes(message.ID)
        );

        setChosenMessages(filteredMessages);
    }, [chosenMessageIDs, combinedMessages]);

    useEffect(() => {
        setUserName(auth.currentUser.displayName);
        setUserUID(auth.currentUser.uid);
    }, []);

    const scrollViewRef = useRef(); // Reference to the ScrollView

    useEffect(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }, [combinedMessages]); // Scroll to bottom when combinedMessages changes

    // handle fetching recorded messages from server
    const handleFetchData = async () => {
        try {
            setIsLoading(true);

            // Call fetchDataFromFirestore and await the result
            const userMessages = await fetchDataFromFirestore(
                `userMessages${SERVICE_NAME}`,
                userUID
            );

            const aiMessages = await fetchDataFromFirestore(
                `aiMessages${SERVICE_NAME}`,
                userUID
            );

            setUserMessages(userMessages);
            setAiMessages(aiMessages);

            setIsLoading(false);
        } catch (error) {
            console.error(
                `"Error fetching ${userName} messages from Firestore: "`,
                error
            );
        }
    };

    const combinedMessages = combineArrays(
        userMessages.flat(),
        aiMessages.flat()
    );

    // // handle toggle play and pause for loaded messages from server
    const handlePressTogglePlayPauseButton = async (audioPath) => {
        // Check if the pressed audio is currently playing
        if (onPlayingAudio.audioPath === audioPath) {
            // Toggle the play/pause state
            await togglePlayPause(audioPath); // Ensure this function handles toggling logic
            setOnPlayingAudio({ audioPath: audioPath, isPlaying: false });
        } else {
            // Play the new audio and update the currentAudio state
            await togglePlayPause(audioPath); // Ensure this starts playing the new audio
            setOnPlayingAudio({ audioPath: audioPath, isPlaying: true });
        }
    };

    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState(combinedMessages);

    // Effect to trigger search when userMessages or aiMessages state changes
    useEffect(() => {
        handleSearch(searchText);
    }, [userMessages, aiMessages]);

    // handle real-time search for loaded Messages
    const handleSearch = (text) => {
        setSearchText(text);
        const filteredMessages = combinedMessages.filter((item) =>
            item.search.toLowerCase().includes(text.toLowerCase())
        );

        // Create a set to store unique IDs of filtered items
        const filteredItemIDs = new Set(
            filteredMessages.map((item) => item.ID)
        );

        // Include all items with IDs present in the filteredItemIDs set
        const filteredDataWithSameIDs = combinedMessages.filter((item) =>
            filteredItemIDs.has(item.ID)
        );

        setFilteredData(filteredDataWithSameIDs);
    };

    // handle deleting chosenMessages from server
    const handleDeleteChosenMessages = async () => {
        setIsLoading(true);
        try {
            for (const message of chosenMessages) {
                const ID = message.ID;

                await fetchDeleteMessagesFromServer(ID);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
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

            <HelloUserCard userName={userName} />

            <Text
                style={[
                    TextStyles.HeaderPanelTitle,
                    { fontSize: 30, paddingTop: 30, paddingHorizontal: 20 },
                ]}
            >
                Conversation Records with Mr. Guffawlius
            </Text>

            <View
                style={{
                    ...ConversationAreaFrameForRecordsStyle,
                }}
            >
                <View
                    style={{
                        ...AuthFormFormat,
                        alignSelf: "center",
                        marginTop: 5,
                        marginBottom: 10,
                        backgroundColor: "rgba(60, 169, 209, 0.2)",
                    }}
                >
                    <TextInput
                        placeholder="What are you looking for ..."
                        placeholderTextColor={"grey"}
                        style={{ height: "100%", color: "white" }}
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                </View>

                <ScrollView
                    ref={scrollViewRef} // Attach the ref to the ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={{ marginBottom: 35 }}
                >
                    {isLoading ? (
                        <View
                            style={{
                                marginVertical: hp(20),
                                alignItems: "center",
                            }}
                        >
                            <Wander size={68} color="rgba(255, 255, 255, 1)" />
                        </View>
                    ) : (
                        filteredData.map((item, index) => {
                            const isChosen = chosenMessageIDs.includes(item.ID);

                            if (item.source === "user") {
                                return (
                                    <SpeechBubbleForRecords
                                        key={index}
                                        ID={item.ID}
                                        source={userName}
                                        audioPath={item.audioPath}
                                        date={item.date}
                                        text={item.text}
                                        onPlayingAudio={onPlayingAudio}
                                        handlePressTogglePlayPauseButton={
                                            handlePressTogglePlayPauseButton
                                            // playAudiofromAudioPath
                                        }
                                        isChosen={isChosen}
                                        toggleChosen={() =>
                                            toggleChosenMessageID(
                                                item.ID,
                                                setChosenMessageIDs
                                            )
                                        }
                                    />
                                );
                            } else if (item.source === "ai") {
                                return (
                                    <SpeechBubbleForRecords
                                        key={index}
                                        ID={item.ID}
                                        source={"ai"}
                                        audioPath={item.audioPath}
                                        date={item.date}
                                        text={item.text}
                                        onPlayingAudio={onPlayingAudio}
                                        handlePressTogglePlayPauseButton={
                                            handlePressTogglePlayPauseButton
                                            // playAudiofromAudioPath
                                        }
                                        isChosen={isChosen}
                                        toggleChosen={() =>
                                            toggleChosenMessageID(
                                                item.ID,
                                                setChosenMessageIDs
                                            )
                                        }
                                    />
                                );
                            }
                        })
                    )}
                </ScrollView>

                {/* delete button */}
                <View
                    style={{
                        position: "absolute",
                        top: hp(61),
                        alignSelf: "flex-end",
                        paddingRight: 15,
                        flexDirection: "row",
                    }}
                >
                    <Pressable
                        onPress={async () => {
                            await handleDeleteChosenMessages();
                            await handleFetchData();
                        }}
                    >
                        <MaterialCommunityIcons
                            name="delete-variant"
                            size={32}
                            color="white"
                        />
                    </Pressable>
                </View>
            </View>

            {/* Buttons */}
            <View
                style={{
                    position: "absolute",
                    bottom: hp(2.5),
                    flexDirection: "row",
                    paddingHorizontal: wp(5),
                    width: "100%",
                }}
            >
                <View style={{ flex: 1 }}>
                    <GoBackOneStepButton text={"Back "} />
                </View>

                <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <HomeButton />
                </View>
            </View>
        </View>
    );
}
