import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../utils/authService";
import { storage } from "../firebase-config";
import { ref, getDownloadURL } from "firebase/storage";
import defaultAvatar from "../assets/avatars/avatar_2.png";
import { ToastContainer, toast } from "react-toastify";
import "../styles/StudyParticipants.css";

function StudyParticipants({ socket, roomCode }) {
  const [participants, setParticipants] = useState([]);

  // Fetch initial participants and setup WebSocket listeners
  useEffect(() => {
    if (!roomCode) return;

    const fetchInitialData = async () => {
      try {
        await fetchUserData();
        await fetchParticipants(roomCode);
      } catch (error) {
        console.error("Initial data fetch error:", error);
        toast.error("Failed to load participants");
      }
    };

    fetchInitialData();

    // WebSocket message handler
    const handleWebSocketMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "participants_update") {
          const updatedParticipants = await Promise.all(
            data.participants.map(async (username) => {
              const imageUrl = await fetchParticipantData(username);
              return { username, imageUrl };
            })
          );
          setParticipants(updatedParticipants);
        }
      } catch (error) {
        console.error("WebSocket message handling error:", error);
      }
    };

    if (socket) {
      socket.addEventListener('message', handleWebSocketMessage);
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleWebSocketMessage);
      }
    };
  }, [roomCode, socket]);

  const fetchUserData = async () => {
    try {
      const data = await getAuthenticatedRequest("/profile/", "GET");
      return data.username || "Anonymous";
    } catch (error) {
      console.error("Error fetching user data", error);
      return "Anonymous";
    }
  };

  const fetchParticipants = async (roomCode) => {
    try {
      const response = await getAuthenticatedRequest(
        `/get-participants/?roomCode=${roomCode}`,
        "GET"
      );

      const participantsWithImages = await Promise.all(
        response.participantsList.map(async (participant) => {
          const imageUrl = await fetchParticipantData(participant.username);
          return { username: participant.username, imageUrl };
        })
      );

      setParticipants(participantsWithImages);
    } catch (error) {
      console.error("Error fetching participants:", error);
      throw error;
    }
  };

  const fetchParticipantData = async (username) => {
    if (!username) return defaultAvatar;

    try {
      const imageRef = ref(storage, `avatars/${username}`);
      return await getDownloadURL(imageRef).catch(() => defaultAvatar);
    } catch (error) {
      console.error("Error fetching participant image:", error);
      return defaultAvatar;
    }
  };

  return (
    <div className="user-list-container">
      <div className="users">
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <div key={`${participant.username}-${index}`} className="user-circle">
              <div className="user-image">
                <img
                  src={participant.imageUrl || defaultAvatar}
                  alt={`${participant.username}'s profile`}
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                  className="user-image"
                />
              </div>
              <div className="user-name">
                {participant.username}
              </div>
            </div>
          ))
        ) : (
          <div className="no-participants">No participants in this room</div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default StudyParticipants;