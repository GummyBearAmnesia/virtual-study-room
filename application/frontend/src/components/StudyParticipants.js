import React, { useState, useEffect } from 'react';
import axios from "axios";
import { getAuthenticatedRequest } from "../pages/utils/authService";
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/StudyParticipants.css";
import { storage } from "../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import defaultAvatar from '../assets/avatars/avatar_2.png';
import { ToastContainer, toast } from 'react-toastify';

const StudyParticipants = () => {

    // Web socket handling
    const [roomCode, setRoomCode] = useState("");   // Ensure that the room code is defined
    const [roomName, setRoomName] = useState("");
    const [participants, setParticipants] = useState([]); // State to store participants

    // Use to navigate to the created room / joined room
    const navigate = useNavigate(); // initialise

    const { roomCode: urlRoomCode } = useParams(); // Get roomCode from URL params

    console.log("The room code is: ", roomCode)
    // Fetch participants when the component mounts or roomCode changes
    useEffect(() => {
        if (urlRoomCode) {
            setRoomCode(urlRoomCode); // Set the roomCode state
            fetchParticipants(urlRoomCode);
            fetchUserData()

            // Set up WebSocket connection
            const socket = new WebSocket(`ws://localhost:8000/ws/room/${urlRoomCode}/`);

            // Listen for participants updates
            socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'participants_update') {
                setParticipants(data.participants);
            }
            };

            // Handle WebSocket errors
            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            // Cleanup WebSocket connection on unmount
            return () => {
                socket.close();
            };
        }
    }, [urlRoomCode]);

    // Function to fetch participants
    const fetchParticipants = async (roomCode) => {
        try {
            const response = await getAuthenticatedRequest(`/get-participants/?roomCode=${roomCode}`, "GET");
            console.log("Participants",response.participantsList)

            // Fetch profile pictures for each participant
            const participantsWithImages = await Promise.all(
                response.participantsList.map(async (participant) => {
                    const imageUrl = await fetchUserData(participant.username);
                    return { ...participant, imageUrl }; // Add imageUrl to the participant object
                })
            );

            setParticipants(participantsWithImages); // Update participants state with image URLs

        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    // Function to get user profiles

    const fetchUserData = async (username) => {
        try {
            const data = await getAuthenticatedRequest("/profile/", "GET");

            //fetch profile picture from firebase using user_id
            const imageRef = ref(storage, `avatars/${username}`);
            const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); //default image if not found
            return imageUrl;    // Return the imageUrl
        }
        catch (error) {
            toast.error("error fetching user data");
            return defaultAvatar;   // IF there is an error return default avatar
        }
    };


    return(
        <div className="users">
            {/* Dynamically render participants */}
            {participants.map((participant, index) => (
                <div key={index} className="user-circle">
                    <div className="user-image">
                        <img src={participant.imageUrl} alt="profile" className="user-image" />
                    </div>
                    <div className="user-name">
                        {participant.username}
                    </div>
                </div>
            ))}
        </div>)
    };

export default StudyParticipants;