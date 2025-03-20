import React, { useState } from "react";
import axios from "axios";
import GroupStudyRoom from '../pages/GroupStudyPage';
import { getAuthenticatedRequest } from "../utils/authService";
import { useNavigate } from 'react-router-dom';
import "../styles/StudyRoomComponent.css";

const StudyRoomComponent = () => {
  // Web socket handling
  const [roomCode, setRoomCode] = useState(""); // Ensure that the room code is defined
  const [roomName, setRoomName] = useState("");
  const [joined, setJoined] = useState(false);
  const [left, setLeaving] = useState(false);

  // Use to navigate to the created room / joined room
  const navigate = useNavigate(); // initialise

  // Method to create Room
  const createRoom = async () => {
    console.log("Creating room...");

    try {
      // This stuff gets sent to the backend!
      const response = await getAuthenticatedRequest("/create-room/", "POST", {
        sessionName: roomName, // Sends the room name to the backend
      });

      console.log("Testing here");
      console.log(response);
      console.log(response.roomCode);
      setRoomCode(response.roomCode);
      setJoined(true);

      // Redirect to the Group Study Room page with the Room Code
      console.log("Joining .. . .");

      navigate(`/group-study/${response.roomCode}`, {
        state: { roomCode: response.roomCode, roomName: roomName, roomList: response.roomList },
      });
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };


  // Methods to join room
  const joinRoom = async () => {
    try {
      // This stuff gets sent to the backend!
      const response = await getAuthenticatedRequest("/join-room/", "POST", {
        roomCode: roomCode, // Sends the room name to the backend
      });

      console.log("Joining .. . .");

      console.log("ROOM CODE", roomCode);
      // To get the room name
      const response1 = await getAuthenticatedRequest(
        `/get-room-details/?roomCode=${roomCode}`,
        "GET"
      );

      if (response.status === 200) setJoined(true);
      // Redirect to the Group Study Room page with the roomCode
      navigate(`/group-study/${roomCode}`, {
        state: { roomCode: roomCode, roomName: response1.sessionName, roomList: response1.roomList },
      });
      console.log("User has joined the room");
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };
  /*
  // Methods to leave room
  const leaveRoom = async () => {
    try {
      // This stuff gets sent to the backend!
      const response = await getAuthenticatedRequest("/leave-room/", "POST", {
        roomCode: roomCode, // Sends the room name to the backend
      });

      console.log("leaving .. . .");

      console.log("ROOM CODE", roomCode);

      if (response.status === 200) setLeaving(true);
      // Redirect to the Dashboard
      navigate("/dashboard/", {});
      console.log("User has left the room");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };
  */

  return (
    <div className="dashboard-panel">
      <div>
        {!joined ? (
          <>
            {/* To create a study room, text field to enter a room name ( NOT CODE, code is auto generated ) */}
            <div className="input-group">
              <input
                type="text"
                placeholder="I want to study..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <button className="gsr" onClick={createRoom}>
                Create Room
              </button>
            </div>

            {/* For joining the room, there is also a text input for the room code"*/}
            <div className="input-group">
              <input
                type="text"
                placeholder="Room Code... "
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <button className="gsr" onClick={joinRoom}>
                Join Room
              </button>
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
