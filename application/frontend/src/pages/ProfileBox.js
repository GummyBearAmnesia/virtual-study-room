import React, { useState, useEffect } from 'react';
import { storage } from "../firebase-config";
import { Navigate, useNavigate } from 'react-router-dom';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getAuthenticatedRequest, getAccessToken } from "./utils/authService";
import defaultAvatar from '../assets/avatars/avatar_2.png';
import UserAvatar from '../components/UserAvatar';
import UserBadges from '../components/UserBadges';
import "../styles/ProfileBox.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProfileBox() {
    const navigate = useNavigate();
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [userBadges, setUserBadges] = useState([]);
    const [showModal, setShowModal] = useState(false); 
    const [userData, setUserData] = useState({
        username: null,
        description: "",
        image: defaultAvatar, //default image
        avatarSrc: null, //represents selectable PFPs
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getAuthenticatedRequest("/profile/", "GET");

                //fetch profile picture from firebase using user_id
                const imageRef = ref(storage, `avatars/${data.username}`);
                const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); //default image if not found

                //update user data
                setUserData({
                    username: data.username || "N/A",
                    description: data.description || "",
                    image: imageUrl,
                    avatarSrc: imageUrl,
                });

                //fetch user badges
                const badges = await getUserBadges();
                setUserBadges(badges);
            } 
            catch (error) {
                toast.error("error fetching user data");
            }
        };

        fetchUserData();

    }, []);

    const handleChangeAvatar = async (event) => {
        //get the selected file
        const file = event.target.files[0];
        if (!file || !userData.username) {
            toast.error("no valid user id or file selected");
            return;
        }
        //get the file reference from firebase
        const fileRef = ref(storage, `avatars/${userData.username}`);
        try 
        {
            //upload file to firebase
            await uploadBytes(fileRef, file);

            //get imageURL
            const imageUrl = await getDownloadURL(fileRef);

            //update userData with new imageURL
            setUserData((prevData) => ({
                ...prevData,
                image: imageUrl,
                avatarSrc: imageUrl,
            }));

            toast.success("avatar uploaded successfully");
        } 
        catch (error) {
            toast.error("error uploading avatar");
        }
    }

    const handleLogOff = async () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
    }

    const handleChangeDescription = (event) => {
        const newDescription = event.target.value;
        setUserData((prevData) => ({
            ...prevData,
            description: newDescription,
        }));
    }

    const handleSaveDescription = async () => {
        try {
            //update new description in the backend
            const data = await getAuthenticatedRequest("/description/", "PUT", {
                description: userData.description,
            });

            setUserData((prevData) => ({
                ...prevData,
                description: data.description,
            }));

            toast.success("description updated successfully");
        }
        catch (error) {
            toast.error("error updating description");
        }

    }

    const handleDefaultPFP = async (avatarSrc) => {
        const fileRef = ref(storage, `avatars/${userData.username}`);
        try 
        {
            //upload file to firebase
            const response = await fetch(avatarSrc);
            const blob = await response.blob();
            await uploadBytes(fileRef, blob);

            //get imageURL
            const imageUrl = await getDownloadURL(fileRef);

            //update userData with new imageURL
            setUserData((prevData) => ({
                ...prevData,
                image: imageUrl,
                avatarSrc: avatarSrc,
            }));

            toast.success("avatar selected successfully");
        } 
        catch (error) {
            toast.error("error selecting avatar from defaults")
        }
    }

    const getUserBadges = async () => {
        try {
            //get badges from rewards model in backend
            const badges = await getAuthenticatedRequest("/badges/", "GET");
            return badges;
        } catch (error) {
            toast.error("error fetching user badges")
            return [];
        }
    }

    return (
        <div className='profile-container'>
            <ToastContainer position='top-center'/>
            <div className='profile-box'>
                <h1 className='profile-title'>Profile</h1>
                <div className='picture-container'>
                    <div className='container1'>
                        <img src={userData.image} alt="logo" className="profile-pic" />
                        <h1 className='profile-username'>{userData.username}</h1>
                        <input type="file" accept="image/*" data-testid='file-input' id='change-avatar' onChange={handleChangeAvatar} className="change-avatar-button" style={{ display: 'none' }} />
                    </div>
                    <div className='container2'>
                        <button type="button" className="logoff-button" onClick={handleLogOff}>LOG OFF</button>
                        <button type='button' className='show-modal-button' onClick={() => setShowModal(true)}></button>
                    </div>
                </div>

                {showModal && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <span className="close-button" onClick={() => setShowModal(false)}>&times;</span>
                            <div className='button-container'>
                                <div className='inventory-align'>
                                    <label htmlFor="change-avatar" className="upload-button">UPLOAD AVATAR</label>
                                    <button className="default-select-button" onClick={() => setShowAvatarSelector(!showAvatarSelector)}>DEFAULT AVATARS</button>
                                </div>
                                {showAvatarSelector && (<div className='avatar-selector'><UserAvatar onSelect={handleDefaultPFP} currentAvatar={userData.avatarSrc}/></div>)}
                            </div>
                            <textarea
                                className="profile-description"
                                value={userData.description}
                                onChange={handleChangeDescription}
                                placeholder="Please Enter Description"
                            />
                            <button type="button" className="save-desc-button" onClick={handleSaveDescription}>SAVE DESCRIPTION</button>
                            <button 
                                className='inventory-button'
                                onClick={() => setShowInventory(!showInventory)}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    backgroundColor: showInventory ? '#baf2e9' : '#bad7f5',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    marginBottom: '10px',
                                }}
                                aria-label={showInventory ? 'Hide Badge Collection' : 'View Badge Collection'}
                                >🏆
                            </button>
                            {showInventory && (
                                <div className='inventory-content'>
                                    <h2>Your Badge Collection</h2>
                                    <UserBadges userBadges={userBadges}/>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileBox;