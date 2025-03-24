import React, { useEffect, useState } from "react";
import axios from "axios";

// Import badge images
import badge1 from '../assets/badges/badge_1.png';  // Trophy
import badge2 from '../assets/badges/badge_2.png';  // Star
import badge3 from '../assets/badges/badge_3.png';  // Glowing star
import badge4 from '../assets/badges/badge_4.png';  // 1st place medal
import badge5 from '../assets/badges/badge_5.png';  // 2nd place medal
import badge6 from '../assets/badges/badge_6.png';  // 3rd place medal
import badge7 from '../assets/badges/badge_7.png';  // Crown
import badge8 from '../assets/badges/badge_8.png';  // Fire

//UserBadges Component to display all badges for the users

//List of all available badges
const badges = [
  badge1, badge2, badge3, badge4,
  badge5, badge6, badge7, badge8
];

const UserBadges = () => {
  const [userBadges, setUserBadges] = useState([]); // State to store earned badges

  useEffect(() => {
    const fetchBadges = async () => {
      const token = localStorage.getItem("access_token"); // Get the access token from localStorage
      if (!token) {
        console.error("No access token found. Please log in.");
        return;
      }
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/analytics/", // Endpoint for fetching analytics
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the access token in the request
            },
            withCredentials: true,
          }
        );
        setUserBadges(response.data.earned_badges); // Set the earned badges
        console.log("Earned Badges:", response.data.earned_badges); // Debug: Log the response
      } catch (error) {
        console.error(
          "Error fetching badges:",
          error.response?.status || error.message
        );
      }
    };
    fetchBadges();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Used to organise badges into rows of 4 for disply
  const rows = [];
  for (let i = 0; i < badges.length; i += 4) {
    rows.push(badges.slice(i, i + 4));
  }

  // Function to check if a specific badge has been earned
  const isBadgeEarned = (rewardNumber) => {
    return userBadges.some(badge => badge.reward_number === rewardNumber);
  }

  // Function returns the date when a badge was earned
  const getBadgeEarnedDate = (rewardNumber) => {
    const badge = userBadges.find((badge) => badge.reward_number === rewardNumber);
    return badge ? new Date(badge.date_earned).toLocaleDateString() : null;
  }

  return (
    <div style={{ width: '500px' }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((badgeUrl, colIndex) => {
            const badgeIndex = rowIndex * 4 + colIndex + 1;
            const isEarned = userBadges && isBadgeEarned(badgeIndex);

            return (
              <div
                key={rowIndex * 4 + colIndex}
                style={{
                  margin: '10px',
                  textAlign: 'center',
                  position: 'relative',
                  padding: '8px',
                  backgroundColor: isEarned ? '#fff5f7' : 'transparent',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <img
                  src={badgeUrl}
                  alt={`Badge ${badgeIndex}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '5px',
                    opacity: isEarned ? '1' : '0.4',
                    filter: isEarned ? 'drop-shadow(0 0 4px #f2e2ba)' : 'grayscale(100%)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
                <div style={{
                  fontSize: '14px',
                  fontWeight: isEarned ? 'bold' : 'normal',
                  color: isEarned ? '#000' : '#666'
                }}>
                  Badge {badgeIndex}
                </div>
                {isEarned && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    Earned: {getBadgeEarnedDate(badgeIndex)}
                  </div>
                )}
                {!isEarned && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    Not yet earned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default UserBadges;