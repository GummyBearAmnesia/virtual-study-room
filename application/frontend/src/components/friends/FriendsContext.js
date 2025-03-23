import React, { useContext } from "react";
import { createContext, useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";
import defaultAvatar from '../../assets/avatars/avatar_2.png';
import { storage } from "../../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

export const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
    const [invitationsRequests, setInvitations] = useState([]);
    const [friendRequests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (userId = null) => {
        setLoading(true);
        try {
            const requestsData = await getAuthenticatedRequest("/get_pending_friends/");
            const invitationsData = await getAuthenticatedRequest("/get_made_requests/");
            const friendsData = await getAuthenticatedRequest("/get_friends/");

            setInvitations(invitationsData);
            setRequests(requestsData);

            const friendsWithImages = await Promise.all(
                friendsData.map(async (friend) => {
                    const imageRef = ref(storage, `avatars/${friend.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); 
                    return { ...friend, image: imageUrl }; 
                })
            );

            const invitationsWithImages = await Promise.all(
                invitationsData.map(async (invitation) => {
                    const imageRef = ref(storage, `avatars/${invitation.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); 
                    return { ...invitation, image: imageUrl };
                })
            );

            const requestsWithImages = await Promise.all(
                requestsData.map(async (request) => {
                    const imageRef = ref(storage, `avatars/${request.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar);
                    return { ...request, image: imageUrl };
                })
            );

            setFriends(friendsWithImages);
            setInvitations(invitationsWithImages);
            setRequests(requestsWithImages);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };


    const manageFriends = async (request, Id, method) => {
        try {
            const response = await getAuthenticatedRequest(`/${request}/${Id}/`, method);

            if (response.status !== 0) {
                const requests = friendRequests.find(req => req.id === Id);
                const invitation = invitationsRequests.find(req => req.id === Id);
                if (invitation || requests) {
                    setRequests(prev => prev.filter(req => req.id !== Id));
                    setInvitations(prev => prev.filter(req => req.id !== Id));
                    if (request == 'accept_friend') {
                        setFriends(prev => [...prev, requests]);
                    }
                }
                else {
                    if (request == 'create_friend_request') {
                        setInvitations(prev => [...prev, response])
                    } else {
                        const friend = friends.find(req => req.id === Id);
                        setFriends(prev => prev.filter(req => req.id !== Id));
                        setRequests(prev => [...prev, friend]);
                    }

                }
            } else {
                console.error("Error accepting friend request");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const onAccept = async (requestId, request, method) => {
        manageFriends(request, requestId, method);
    };

    const onReject = async (requestId) => {
        await manageFriends('reject_friend', requestId, "DELETE");
    };

    return (
        <FriendsContext.Provider value={{ friendRequests, invitationsRequests, friends, onAccept, onReject, loading, manageFriends }}>
            {children}
        </FriendsContext.Provider>
    );
};
