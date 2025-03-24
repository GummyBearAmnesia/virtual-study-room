import React, { useRef, useEffect, useState, useCallback } from "react";
import "../styles/GroupStudyPage.css";
import MotivationalMessage from "./Motivation";
import musicLogo from "../assets/music_logo.png";
import customLogo from "../assets/customisation_logo.png";
import copyLogo from "../assets/copy_logo.png";
import exitLogo from "../assets/exit_logo.png";
import ToDoList from "../components/ToDoListComponents/newToDoList";
import StudyTimer from "../components/StudyTimer.js";
import StudyParticipants from "../components/StudyParticipants.js";
import { getAuthenticatedRequest } from "../utils/authService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../styles/ChatBox.css";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../assets/avatars/avatar_2.png";
import { storage } from "../firebase-config";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  listAll,
  deleteObject,
} from "firebase/storage";
import SharedMaterials from "./SharedMaterials.js";
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import SpotifyButton from '../components/SpotifyButton';
import FloatingMusicPlayer from "../components/FloatingWindow.js";

function GroupStudyPage() {
  const [participants, setParticipants] = useState([]); // State to store participants
  const [open, setOpen] = useState(false); //open and close states for pop-up window for spotify button

  // Location object used for state
  const location = useLocation();
  const navigate = useNavigate(); // initialise

  // Track the logged-in user
  const [loggedInUser, setLoggedInUser] = useState(null);
  const chatMessagesRef = useRef(null); // Ref for the chat messages container

  // Function to scroll to the bottom of the chat messages container
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const { roomCode, roomName, roomList } = location.state || {
    roomCode: "",
    roomName: "",
    roomList: "",
  };
  // Retrieve roomCode and roomName from state

  // Retrieve roomCode from state if not in URL
  const stateRoomCode = location.state?.roomCode;
  const finalRoomCode = roomCode || stateRoomCode;
  // finalRoomCode is what we should refer to!

  const [isActiveAddMore, setIsActiveAddMore] = useState(false); //initialise both variables: isActive and setIsActive to false
  const [isActiveMusic, setIsActiveMusic] = useState(false);
  const [isActiveCustom, setIsActiveCustom] = useState(false);
  const [isActiveCopy, setIsActiveCopy] = useState(false);
  const [isActiveExit, setIsActiveExit] = useState(false);

  // for websockets
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [customInput, setCustomInput] = useState(""); // For the customisation box
  const [chatInput, setChatInput] = useState(""); //Fot chat box

  const [username, setUsername] = useState("ANON_USER"); // Default to 'ANON_USER' before fetching. Stores username fetched from the backend

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const [shouldReconnect, setShouldReconnect] = useState(true); // Determines whether or not to auto-reconnect user to websocket server


  //handle open for spotify button
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  //handle close for spotify button
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenMusicButton = () => {
    // Assuming this should toggle the floating music player visibility
    setOpenMusicPlayer(true);
};

  const [openMusicPlayer, setOpenMusicPlayer] = useState(false); //handle open and close for free tracks

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).slice(-2);
    }
    return color;
  };


  // Updates the websocket saved everytime it changes
  useEffect(() => {
    if (socket) {
      console.log("Socket state updated:", socket);
    }
    scrollToBottom();
  }, [socket, messages]); // This effect runs whenever `socket` changes

  
  useEffect(() => {
    // Ensure room code is given
    if (!finalRoomCode) {
      console.error("Room code is missing.");
      return;
    }

    console.log("GroupStudyPage UseEffect is being called now!");

    if (finalRoomCode) {
      // Get the logged in user's data
      fetchUserData();

      // Retrieves the room participants currently in the room when joining
      // Fetches the data for each user ( username and profile picture from firebase )
      fetchParticipants(finalRoomCode);
    }

    // If the user disconnects by accident due to a timeout, will auto-reconnect
    setShouldReconnect(true);

    // Initial connection to the websocket
    connectWebSocket();

    // Cleanup function to prevent reconnect attempts after the component unmounts
    return () => {
      setShouldReconnect(false); // Signal not to reconnect anymore
      if (socket) {
        console.log("Closing WebSocket connection on unmount...");
        socket.close();
      }
    };
  }, [finalRoomCode, shouldReconnect]);

  // Method for connecting to the websocket
  const connectWebSocket = () => {
    // Check if a WebSocket connection already exists, not sure if this actually does anything?
    if (socket === WebSocket.OPEN) {
      console.log("Using existing WebSocket connection");
      return; // Reuse the existing connection
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/room/${finalRoomCode}/`); 
    // const socket = new WebSocket("wss://studyspot.pythonanywhere.com/ws/room/room_code/");  // Production (deployed backend)

    //Logs when connection is established
    ws.onopen = () => {
      console.log("Connected to Websocket");
      setSocket(ws);
      console.log("socket", ws);
    };

    //Handles incoming messages.
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket Message:", data);
      if (data.type === "chat_message") {
        //if message type is 'chat_message' then add to messages state
        // Ensure the message is structured as an object with `sender` and `text`
        console.log("Received message:", data); // Debugging
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, text: data.message },
        ]);
      }
      if (data.type === "participants_update") {
        console.log("Re-rendering the participants on the page...");
        // Update the participants list
        // Update the participants list
        const updatedParticipants = await Promise.all(
          data.participants.map(async (username) => {
            const imageUrl = await fetchParticipantData(username);
            return { username, imageUrl };
          })
        );
        setParticipants(updatedParticipants);
      } else if (data.type === "typing") {
        setTypingUser(data.sender);

        // Remove "typing" message after 3 seconds
        setTimeout(() => {
          setTypingUser("");
        }, 3000);
      }
    };

    //Logs when the connection is closed
    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      if (shouldReconnect) {
        console.log("Reconnecting");
        setTimeout(connectWebSocket, 1000); // Attempt to reconnect after 1 seconds
      }
    };
    setSocket(ws);
  };

  //Sends chat message through websocket connection
  const sendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected.");
      return;
    }

    if (!chatInput.trim()) {
      // Prevent empty messages
      console.error("Cannot send an empty message.");
      return;
    }

    //construct a message with type, message and sender
    const messageData = {
      type: "chat_message",
      message: chatInput,
      sender: username,
    };

    console.log("Sending message to WebSocket:", messageData); // Debugging log

    socket.send(JSON.stringify(messageData));
    setChatInput(""); //resets chatinput field after sending message
  };
  // end of websockets stuff

  //Fetches logged in user's username when component mounts
  //Updates username state with fetched data or defaults to 'anonymous'
  const fetchUserData = async () => {
    try {
      const data = await getAuthenticatedRequest("/profile/", "GET");
      setUsername(data.username || "Anonymous"); // Fallback in case username is missing
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  // Function to fetch participants
  const fetchParticipants = async (roomCode) => {
    console.log("Fetching participants");

    try {
      const response = await getAuthenticatedRequest(
        `/get-participants/?roomCode=${roomCode}`,
        "GET"
      );
      console.log("Participants", response.participantsList);

      // Fetch profile pictures for each participant
      const participantsWithImages = await Promise.all(
        response.participantsList.map(async (participant) => {
          const imageUrl = await fetchParticipantData(participant.username);
          return { ...participant, imageUrl }; // Add imageUrl to the participant object
        })
      );

      setParticipants(participantsWithImages); // Update participants state with image URLs
      console.log("num Participants", participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  // Function to get user profiles
  const fetchParticipantData = async (username) => {
    if (!username) {
      return defaultAvatar; // Return a default avatar if username is undefined
    }
    console.log("fetched user data", username);

    try {
      const data = await getAuthenticatedRequest("/profile/", "GET");

      //fetch profile picture from firebase using user_id
      const imageRef = ref(storage, `avatars/${username}`);
      const imageUrl = await getDownloadURL(imageRef).catch(
        () => defaultAvatar
      ); //default image if not found
      return imageUrl; // Return the imageUrl
    } catch (error) {
      toast.error("Error fetching user data");
      return defaultAvatar; // IF there is an error return default avatar
    }
  };

  const handleMouseDown = (btnType) => {
    //when the button is pressed then the variable setIsActive is set to True
    if (btnType === "addMore") {
      setIsActiveAddMore(true);
    } else if (btnType === "music") {
      setIsActiveMusic(true);
    } else if (btnType === "custom") {
      setIsActiveCustom(true);
    } else if (btnType === "copy") {
      setIsActiveCopy(true);
    } else if (btnType === "exit") {
      setIsActiveExit(true);
    }
  };

  const handleMouseUp = (btnType) => {
    //when the button is released then setIsActive is set to False
    if (btnType === "addMore") {
      setIsActiveAddMore(false);
    } else if (btnType === "music") {
      setIsActiveMusic(false);
    } else if (btnType === "custom") {
      setIsActiveCustom(false);
    } else if (btnType === "copy") {
      setIsActiveCopy(false);
    } else if (btnType === "exit") {
      setIsActiveExit(false);
    }
  };

  // Method to leave room
  const leaveRoom = useCallback(async () => {

    try {
      // Close the WebSocket connection if it exists
      if (socket) {
        console.log("Closing WebSocket connection...");
        socket.close(); // Close the WebSocket connection
        setSocket(null);
      } else {
        console.log("Connection to websocket already terminated.");
      }

      const roomCode = finalRoomCode;
      const response1 = await getAuthenticatedRequest(
        `/get-participants/?roomCode=${roomCode}`,
        "GET"
      );
      console.log("Participants", response1.participantsList.length);
      console.log("num participants: ", participants.length);
      if (response1.participantsList.length == 1) {
        await deleteFirebaseFiles(finalRoomCode);
        console.log("all firebase files deleted successfully");
      }
      // delete all files associated with this room from firebase

      // This stuff gets sent to the backend!
      const response = await getAuthenticatedRequest("/leave-room/", "POST", {
        roomCode: finalRoomCode, // Sends the room name to the backend
      });

      console.log("leaving .. . .");

      console.log("ROOM CODE", finalRoomCode);

      if (response.status === 200) setIsActiveExit(true);
      // Redirect to the Dashboard
      navigate(`/dashboard/${response.username}`, {
        state: { userName: response.username },
      });
      console.log("User has left the room", response.username);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, [finalRoomCode, navigate]);

  useEffect(() => {
    const handlePageHide = (event) => {
      leaveRoom();
    };

    // Add event listeners
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [leaveRoom]);

  const deleteFirebaseFiles = async (roomCode) => {
    try {
      const listRef = ref(storage, `shared-materials/${roomCode}/`);
      const res = await listAll(listRef);

      if (res.items.length != 0) {
        // Delete each file in the storage location
        const deletePromises = res.items.map((itemRef) =>
          deleteObject(itemRef)
        );
        await Promise.all(deletePromises);
        console.log("files deleted successfully!");
      } else {
        console.log("no firebase files to delete");
      }
    } catch (error) {
      console.log("error deleting files");
    }
  };

  const handleCopy = () => {
    if (finalRoomCode) {
      navigator.clipboard
        .writeText(finalRoomCode)
        .then(() => {
          toast.success("Code copied to clipboard!", {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: true,
            pauseOnHover: true,
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast.error("Failed to copy code!");
        });
    }
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  let typingTimeout;
  const handleTyping = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    // Send "typing" event to WebSocket
    socket.send(JSON.stringify({ type: "typing", sender: username }));

    // Prevent multiple events from being sent too frequently
    if (isTyping) {
      setIsTyping(true);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  //page is designed in columns
  //First Column: todoList, shared materials
  //Second Column: users listes, motivational message
  //Third Column: Timer, customisation, chatbox

  return (
    <>
      {/* Restructured header */}
      <div className="study-room-header">
        <h2 className="heading">Study Room: {roomName}</h2>
        <div className="header-right-section">
          <div className="utility-bar">
            <button
              type="button"
              className={`music-button ${isActiveMusic ? "active" : ""}`}
              onMouseDown={() => handleMouseDown("music")}
              onMouseUp={() => handleMouseUp("music")}
              onMouseLeave={() => handleMouseUp("music")}
              onClick={handleClickOpen}
            >
              <img src={musicLogo} alt="Music" />
            </button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                  <div style={{ textAlign: 'center' }}>Spotify Player</div>
                  <h2 style={{ textAlign: 'center', fontSize: '14px' }} >(playback for premium users only)</h2>
                </DialogTitle>
                <DialogContent>
                    <SpotifyButton />
                    <Button onClick={handleOpenMusicButton}>Switch to Free Tracks</Button>
                </DialogContent>
            </Dialog>
            <FloatingMusicPlayer isOpen={openMusicPlayer} onClose={() => setOpenMusicPlayer(false)} />
            <button
              type="button"
              className={`customisation-button ${
                isActiveCustom ? "active" : ""
              }`}
              onMouseDown={() => handleMouseDown("custom")}
              onMouseUp={() => handleMouseUp("custom")}
              onMouseLeave={() => handleMouseUp("custom")}
            >
              <img src={customLogo} alt="Customisation" />
            </button>
            <button
              type="button"
              className={`copy-button ${isActiveCopy ? "active" : ""}`}
              onClick={handleCopy}
              onMouseDown={() => handleMouseDown("copy")}
              onMouseUp={() => handleMouseUp("copy")}
              onMouseLeave={() => handleMouseUp("copy")}
            >
              <img src={copyLogo} alt="Copy" />
            </button>
            <button
              type="button"
              className={`exit-button ${isActiveExit ? "active" : ""}`}
              onMouseDown={() => handleMouseDown("exit")}
              onMouseUp={() => handleMouseUp("exit")}
              onMouseLeave={() => handleMouseUp("exit")}
              onClick={() => leaveRoom()}
            >
              <img src={exitLogo} alt="Exit" />
            </button>
          </div>
          <h3 className="gs-heading2">Code: {finalRoomCode}</h3>
        </div>
      </div>

      {/*End of header */}
      <div
        className="groupStudyRoom-container"
        data-testid="groupStudyRoom-container"
      >
        {/*1st Column */}
        <div className="column" role="column" data-testid="column-1">
          <ToDoList
            isShared={true}
            listId={roomList}
            socket={socket}
            roomCode={roomCode}
          />

          <div
            className="sharedMaterials-container"
            data-testid="sharedMaterials-container"
          >
            <SharedMaterials socket={socket} />
          </div>
        </div>
        {/*2nd Column */}
        <div className="column" role="column" data-testid="column-2">
          <div
            className="user-list-container"
            data-testid="user-list-container"
          >
            <div className="users">
              {/* Dynamically render participants */}
              {participants.map((participant, index) => (
                <div key={index} className="user-circle">
                  <div className="user-image">
                    <img
                      src={participant.imageUrl}
                      alt="profile"
                      className="user-image"
                    />
                  </div>

                  <div className="user-name">{participant.username}</div>
                </div>
              ))}
            </div>
          </div>
          <MotivationalMessage data-testid="motivationalMessage-container" />
        </div>
        {/*3rd Column */}
        <div className="column" role="column" data-testid="column-3">
          {/* StudyTimer replaces the timer-container div */}
          <StudyTimer
            roomId={finalRoomCode}
            isHost={true}
            onClose={() => console.log("Timer closed")}
            data-testid="studyTimer-container"
          />
          {/* <StudyTimer roomId="yourRoomId" isHost={true} onClose={() => console.log('Timer closed')} data-testid="studyTimer-container" /> */}
          {/* Chat Box */}
          <div className="chatBox-container">
            {/* Chat Messages */}
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((msg, index) => {
                const userColor = stringToColor(msg.sender); // Generate color for the sender
                const isSameUserAsPrevious =
                  index > 0 && messages[index - 1].sender === msg.sender;

                return  (
                  <div
                    key={index}
                    className={`chat-message ${
                      msg.sender === username ? "current-user" : "other-user"
                    }`}
                    style={{ 
                      color: userColor,
                      borderBottom: isSameUserAsPrevious ? "none" : "1px dotted #eee", // Conditionally apply border
                    }}
                  >
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                );
              })}
              {typingUser && typingUser !== username && (
                <p className="typing-indicator">
                  {" "}
                  <strong>{typingUser}</strong> is typing...
                </p>
              )}
            </div>
            {/* Chat Input */}
            <div className="input-container">
              <input
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
                  placeholder="Type a message..."
                />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default GroupStudyPage;
