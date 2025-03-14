import React, { useState } from 'react';
import axios from "axios";
import GroupStudyRoom from '../pages/GroupStudyPage';
import { getAuthenticatedRequest } from "../pages/utils/authService";
import { useNavigate } from 'react-router-dom';
import "../styles/StudyRoomComponent.css";

const StudyRoomComponent = () => {

    // Web socket handling
    const [roomCode, setRoomCode] = useState("");   // Ensure that the room code is defined
    const [roomName, setRoomName] = useState("");
    const [joined, setJoined] = useState(false);

    // Use to navigate to the created room / joined room
    const navigate = useNavigate(); // initialise

    // Method to create Room
    const createRoom = async () => {
        console.log("Creating room...");

        try {

            // This stuff gets sent to the backend!
            const response = await getAuthenticatedRequest("/create-room/", "POST", {
                sessionName: roomName,  // Sends the room name to the backend
            });

            console.log("Testing here")
            console.log(response);
            console.log(response.roomCode);
            setRoomCode(response.roomCode);
            setJoined(true);

            // Redirect to the Group Study Room page with the Room Code
            console.log("Joining .. . .");
            navigate(`/group-study/${response.roomCode}`, {
                state: { roomCode: response.roomCode, roomName: roomName },
            });
        }

        catch (error) {
            console.error("Error creating room: ", error)
        }
    };


    // Methods to join room
    const joinRoom = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/join-room/", {
                roomCode
            }, {
                headers: { "Content-Type" : "application/json" }
            });

            if (res.status === 200) setJoined(true);
                // Redirect to the Group Study Room page with the roomCode
                navigate(`/group-study-room/${roomCode}`);
        }

        catch (error) {
            console.error("Error joining room:", error)}
    };


    return(
        <div className="dashboard-panel">
                        <div>
                            {!joined ? (
                                <>

                                    {/* To create a study room, text field to enter a room name ( NOT CODE, code is auto generated ) */}
                                    <div className = "input-group">
                                    <input
                                        type = "text"
                                        placeholder = "I want to study..."
                                        value = {roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                    />
                                    <button className = "gsr" onClick={createRoom}>Create Room</button>
                                    </div>

                                    {/* For joining the room, there is also a text input for the room code"*/}
                                    <div className = "input-group">
                                    <input
                                    type = "text"
                                        placeholder = "Room Code... "
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                    />
                                    <button className = "gsr" onClick={joinRoom}>Join Room</button>
                                    </div>

                                </>
                            ) : (
                                <GroupStudyRoom roomCode={roomCode} />
                            )}
                        </div>
                    </div>
    );
};

export default StudyRoomComponent;