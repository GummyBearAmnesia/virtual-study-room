import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfileBox from '../pages/ProfileBox';
import { BrowserRouter as Router } from "react-router-dom";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getAuthenticatedRequest } from '../pages/utils/authService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultAvatar from '../assets/avatars/avatar_2.png';

//mock the necessary modules
jest.mock('../pages/utils/authService');
jest.mock('firebase/storage'); 
jest.mock('../firebase-config.js');
jest.mock('react-toastify', () => {
  const actual = jest.requireActual('react-toastify'); // Preserve the actual module
  return {
    ...actual, // Spread actual exports
    toast: {
      error: jest.fn(),
      success: jest.fn(),
    },
  };
});


describe('ProfileBox', () => {
    beforeEach(() => {
      getAuthenticatedRequest.mockResolvedValue({
          username: 'testuser',
          description: 'Test Description',
      });
    
      getDownloadURL.mockResolvedValue('https://example.com/avatar.png');
      uploadBytes.mockResolvedValue();

      global.fetch = jest.fn(() =>
          Promise.resolve({
              blob: () => Promise.resolve(new Blob(['avatar'])), // Mock the blob response
          })
      );

      jest.spyOn(Storage.prototype, 'removeItem');
    });

    test('renders ProfileBox component', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      expect(screen.getByText('Profile')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByText('testuser')).toBeInTheDocument());
      expect(screen.getByPlaceholderText('Please Enter Description')).toBeInTheDocument();
    });

    test('updates description', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const descriptionTextarea = screen.getByPlaceholderText('Please Enter Description');
      fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });
  
      expect(descriptionTextarea.value).toBe('New Description');
  
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
  
      await waitFor(() => expect(getAuthenticatedRequest).toHaveBeenCalledWith('/description/', 'PUT', { description: 'New Description' }));
    });

    test('handles avatar upload', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
  
      const uploadLabel = screen.getByText('Upload Avatar');
      await act(async () => {
          fireEvent.click(uploadLabel); 
      });
      //find the hidden file input and simulate file selection
      const input = screen.getByTestId('file-input'); // Change this to match your input's label
      await act(async () => {
          fireEvent.change(input, { target: { files: [file] } }); // Simulate file selection
      });
  
      await waitFor(() => expect(uploadBytes).toHaveBeenCalled());
      await waitFor(() => expect(getDownloadURL).toHaveBeenCalled());
    });    
    
    test('handles default avatar selection', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const defaultAvatarButton = screen.getByText('Default Avatars');
      fireEvent.click(defaultAvatarButton);
  
      const avatarImage = screen.getByAltText('Avatar 1');
      fireEvent.click(avatarImage);
  
      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() => expect(uploadBytes).toHaveBeenCalled());
      await waitFor(() => expect(getDownloadURL).toHaveBeenCalled());
    });

    test('fetches user badges', async () => {
      getAuthenticatedRequest.mockResolvedValueOnce([
        { reward_number: 1, date_earned: '2023-01-01' },
        { reward_number: 2, date_earned: '2023-02-01' },
      ]);
  
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const inventoryButton = screen.getByLabelText('View Badge Collection');
      fireEvent.click(inventoryButton);
  
      await waitFor(() => expect(screen.getByText('Your Badge Collection')).toBeInTheDocument());
      expect(screen.getByText('Badge 1')).toBeInTheDocument();
      expect(screen.getByText('Badge 2')).toBeInTheDocument();
    });

    test('logs off user', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const logoffButton = screen.getByText('Log Off');
      fireEvent.click(logoffButton);
  
      await waitFor(() => expect(localStorage.removeItem).toHaveBeenCalledWith('access_token'));
      await waitFor(() => expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token'));
    });

    test('handles error fetching user data', async () => {
      getAuthenticatedRequest.mockRejectedValueOnce(new Error('error fetching user data'));
  
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('error fetching user data'));
    });

    test('handles error when no valid user id or file selected', async () => {
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const uploadLabel = screen.getByText('Upload Avatar');
      await act(async () => {
          fireEvent.click(uploadLabel); 
      });

      const input = screen.getByTestId('file-input');
      await act(async () => {
          fireEvent.change(input, { target: { files: [] } }); //empty file
      });
  
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('no valid user id or file selected'));
    });

    test('handles error uploading avatar', async () => {
      uploadBytes.mockRejectedValueOnce(new Error('error uploading avatar'));

      render(
        <Router>
          <ProfileBox />
        </Router>
      );

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

      const uploadLabel = screen.getByText('Upload Avatar');
      await act(async () => {
          fireEvent.click(uploadLabel); 
      });

      const input = screen.getByTestId('file-input');
      await act(async () => {
          fireEvent.change(input, { target: { files: [file] } }); 
      });

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('error uploading avatar'));
    });

    test('handles error updating description', async () => {
      getAuthenticatedRequest.mockResolvedValueOnce({
        username: 'testuser',
        description: 'Test Description',
      });
      getAuthenticatedRequest.mockRejectedValueOnce(new Error('error updating description'));
  
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const descriptionTextarea = screen.getByPlaceholderText('Please Enter Description');
      fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });
  
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
  
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('error updating description'));
    });

    test('handles error selecting avatar from defaults', async () => {
      uploadBytes.mockRejectedValueOnce(new Error('error selecting avatar from defaults'));
  
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const defaultAvatarButton = screen.getByText('Default Avatars');
      fireEvent.click(defaultAvatarButton);
  
      const avatarImage = screen.getByAltText('Avatar 1');
      fireEvent.click(avatarImage);
  
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('error selecting avatar from defaults'));
    });

    test('handles error fetching user badges', async () => {
      getAuthenticatedRequest.mockResolvedValueOnce({
        username: 'testuser',
        description: 'Test Description',
      });
      getAuthenticatedRequest.mockRejectedValueOnce(new Error('error fetching user badges'));
  
      render(
        <Router>
          <ProfileBox />
        </Router>
      );
  
      const inventoryButton = screen.getByLabelText('View Badge Collection');
      fireEvent.click(inventoryButton);
  
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('error fetching user badges'));
    });

});