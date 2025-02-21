import React, { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import UserBadges from './UserBadges';
import { uploadPlaceholders, preloadImages } from '../utils/uploadImages';
import { getDatabase, ref, set, get } from 'firebase/database';

const UserProfile = ({ userId }) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Start preloading images
        setLoadingProgress(0);
        await preloadImages();
        setLoadingProgress(50);

        // Load user data
        const db = getDatabase();
        const avatarRef = ref(db, `users/${userId}/avatar`);
        const avatarSnapshot = await get(avatarRef);
        setCurrentAvatar(avatarSnapshot.val());
        setLoadingProgress(75);
        
        const badgesRef = ref(db, `users/${userId}/badges`);
        const badgesSnapshot = await get(badgesRef);
        setUserBadges(badgesSnapshot.val() || []);
        setLoadingProgress(100);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        // Maybe show error state
      }
    };

    initializeProfile();
  }, [userId]);

  const handleAvatarSelect = async (avatarUrl) => {
    const db = getDatabase();
    await set(ref(db, `users/${userId}/avatar`), avatarUrl);
    setCurrentAvatar(avatarUrl);
    setShowAvatarSelector(false);
  };

  // Test data for badges
  const testBadges = {
    'badge_1': {
      dateAwarded: new Date().toISOString(),
      badgeId: 'badge_1'
    },
    'badge_4': {
      dateAwarded: new Date().toISOString(),
      badgeId: 'badge_4'
    },
    'badge_7': {
      dateAwarded: new Date().toISOString(),
      badgeId: 'badge_7'
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">
          Loading... {loadingProgress}%
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h1>User Profile</h1>
      
      {/* Avatar Section */}
      <div>
        <h2>Your Avatar</h2>
        <div>
          <div onClick={() => setShowAvatarSelector(!showAvatarSelector)} style={{ cursor: 'pointer' }}>
            {currentAvatar ? (
              <img 
                src={currentAvatar} 
                alt="Avatar" 
                style={{ width: '150px', height: '150px' }}
              />
            ) : (
              <div>Click to select an avatar</div>
            )}
          </div>
          
          {/* Avatar Selector */}
          {showAvatarSelector && (
            <div style={{ marginTop: '10px' }}>
              <h3>Choose Your Avatar</h3>
              <UserAvatar 
                userId={userId} 
                onSelect={handleAvatarSelect}
                currentAvatar={currentAvatar}
              />
            </div>
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setShowInventory(!showInventory)}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: showInventory ? '#b0f2b4' : '#bad7f5',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          aria-label={showInventory ? 'Hide Badge Collection' : 'View Badge Collection'}
        >
          🏆
        </button>

        {showInventory && (
          <div style={{ marginTop: '10px' }}>
            <h2>Your Badge Collection</h2>
            <UserBadges 
              userId={userId} 
              userBadges={testBadges}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 