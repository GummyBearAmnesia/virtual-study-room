import React from "react";
import { render, screen, within, act, fireEvent } from "@testing-library/react";
import GroupStudyPage from "../pages/GroupStudyPage"; 
import axios from "axios";
import Dashboard from '../pages/Dashboard'; 
import Analytics from '../pages/Analytics';
import ToDoList from '../pages/ToDoList';

//mock the necessary modules
jest.mock('../pages/Analytics', () => () => <div>Mocked Analytics</div>);
jest.mock('../pages/ToDoList', () => () => <div>Mocked ToDoList</div>);
jest.mock("axios");
jest.mock("@fontsource/vt323", () => {}); 
jest.mock("@fontsource/press-start-2p", () => {}); 

describe("Dashboard", () => {
    test('renders the Dashboard heading', () => {
        render(<Dashboard />);
    
        // Check for the main heading
        const heading = screen.getByRole('heading', { name: /dashboard/i });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('dashboard-heading');
      });

      test('renders the left panel with correct content', () => {
        render(<Dashboard />);
    
        // Find the left panel
        const leftPanel = screen.getByTestId('left-panel'); // Add data-testid="left-panel" to the left panel div
        expect(leftPanel).toBeInTheDocument();
    
        // Check for child components and panels
        expect(within(leftPanel).getByText('Mocked Analytics')).toBeInTheDocument();
        expect(within(leftPanel).getByText('Calendar')).toBeInTheDocument();
        expect(within(leftPanel).getByText('Invites')).toBeInTheDocument();
      });

      test('renders the main panel with correct content', () => {
        render(<Dashboard />);
    
        // Find the main panel
        const mainPanel = screen.getByTestId('main-panel'); // Add data-testid="main-panel" to the main panel div
        expect(mainPanel).toBeInTheDocument();
    
        // Check for panels
        expect(within(mainPanel).getByText('Profile')).toBeInTheDocument();
        expect(within(mainPanel).getByText('Friends List')).toBeInTheDocument();
        expect(within(mainPanel).getByText('Add Friends')).toBeInTheDocument();
      });
      test('renders the right panel with correct content', () => {
        render(<Dashboard />);
    
        // Find the right panel
        const rightPanel = screen.getByTestId('right-panel'); // Add data-testid="right-panel" to the right panel div
        expect(rightPanel).toBeInTheDocument();
    
        // Check for panels and child components
        expect(within(rightPanel).getByText('Generate Group Study Room')).toBeInTheDocument();
        expect(within(rightPanel).getByText('Mocked ToDoList')).toBeInTheDocument();
      });

});