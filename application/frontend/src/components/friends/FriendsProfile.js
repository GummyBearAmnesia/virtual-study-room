import React, { useState, useEffect } from "react";
import "../../styles/friends/FriendsProfile.css"; // Updated path
import { getAuthenticatedRequest } from "../../utils/authService";
import defaultAvatar from "../../assets/avatars/avatar_2.png";
import { storage } from "../../firebase-config";
import { ref, getDownloadURL } from "firebase/storage";

const FriendsProfile = ({ FriendsId, addUserWindow, setAddUserWindow }) => {
  const [friendsProfile, setFriendsProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!FriendsId) return; // Don't fetch if no friend is selected

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAuthenticatedRequest(
          `/get_friend_profile/${FriendsId}/`,
          "GET"
        );
        const imageRef = ref(storage, `avatars/${data.username}`);
        const imageUrl = await getDownloadURL(imageRef).catch(
          () => defaultAvatar
        );
        setFriendsProfile({ ...data, image: imageUrl });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [FriendsId]); // Fetch data when FriendsId changes

  if (!addUserWindow) return null; // Don't render if modal is closed

  return (
    <div
      className="modal-overlay-friends"
      data-testid="modal-overlay"
      onClick={() => setAddUserWindow(false)}
    >
      <div
        className="modal-content-friends"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="profile-section-friends">
            <button
              className="close-btn-friends"
              onClick={() => setAddUserWindow(false)}
            >
              ×
            </button>
            <img
              src={friendsProfile.image}
              alt="Profile"
              className="profile-pic-friends"
            />

            <div className="profile-details-friends">
              <h4>
                {friendsProfile.name} {friendsProfile.surname}
              </h4>
              <p>
                <strong>Username:</strong> {friendsProfile.username}
              </p>
              <p>
                <strong>Email:</strong> {friendsProfile.email}
              </p>

              {friendsProfile.share_analytics && (
                <div className="analytics-section-friends">
                  <p>
                    📚 <strong>Hours Studied:</strong>{" "}
                    {friendsProfile.hours_studied}
                  </p>
                  <p>
                    🔥 <strong>Streaks:</strong> {friendsProfile.streaks}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsProfile;
