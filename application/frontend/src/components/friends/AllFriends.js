import React, { useContext, useState } from "react";
import { FriendsContext } from "./FriendsContext";
import "../../styles/friends/Friends.css";
import  FriendsProfile from "./FriendsProfile";

const AllFriends = () => {
    const { onReject, friends, loading } = useContext(FriendsContext);

    const [addUserWindow, setAddUserWindow] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    if (loading) return <div className="loading">Loading Friends List...</div>;

    const handleOpenProfile = (listId) => {
        setSelectedUser(listId);
        setAddUserWindow(true);
    };

    return (
        <div className="friends-list-container">
            <div className="friends-list-wrapper">
                <ul className="friends-list">
                    {friends.length === 0 ?
                        (
                        <p className="no-friends">No friends found.</p>
                        )
                        :
                        (
                        friends.map((friend) => (
                            <li key={friend.id} className="friend-card">
                                <img src={friend.image} alt="logo" className="pic" />
                                <h4>{friend.name} {friend.surname}</h4>
                                <p className="username">{friend.username}</p> 
                                <button className="reject-btn" onClick={() => onReject(friend.id)} aria-label="delete friend"><i class="bi bi-trash"></i></button>
                                <button className="details-btn" onClick={() => handleOpenProfile(friend.id)} aria-label="details" > <i class="bi bi-eye"></i> </button>
                            </li>
                        ))
                        )
                    }
                </ul>
            <FriendsProfile
                FriendsId={selectedUser}
                addUserWindow={addUserWindow}
                setAddUserWindow={setAddUserWindow}
            />
            </div>
        </div>
    );
};

export default AllFriends;
