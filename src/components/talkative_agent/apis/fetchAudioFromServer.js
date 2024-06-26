import { REACT_APP_BASE_URL_PRODUCTION, REACT_APP_BASE_URL_DEV } from "@env";

export default async function fetchAudioFromServer(recordingUri) {
    // Create a new FormData instance
    let formData = new FormData();
    // Append the file to the FormData instance
    // The name 'file' should match with the backend expectation
    formData.append("file", {
        uri: recordingUri,
        type: "audio/x-m4a", // Assuming the file is in .m4a format, change if different
        name: "recording.m4a", // The backend should save the file with this name
    });

    // Fetch options including method, headers and body
    const fetchOptions = {
        method: "POST",
        body: formData,
        headers: {
            // Content-Type is not needed here, as it's set automatically by the FormData instance
            // 'Accept' can be set to whatever response type you expect, e.g., 'audio/mpeg'
            Accept: "audio/mpeg",
        },
    };

    // Perform the fetch operation
    try {
        const response = await fetch(
            `${REACT_APP_BASE_URL_PRODUCTION}/talkative_agent/get_ai_audio_response/`,
            fetchOptions
        );
        if (!response.ok) {
            throw new Error(
                `Network response was not ok, status: ${response.status}`
            );
        }
        // If response is okay, return the blob
        return await response.blob();
    } catch (error) {
        console.error("Fetching audio failed", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}
