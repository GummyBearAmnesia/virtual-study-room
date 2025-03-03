import React, { useState, useEffect } from 'react'; 
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { database } from '../firebase-config';
import 'tailwindcss';
import '@fontsource/vt323';
import '@fontsource/press-start-2p';

const StudyTimer = ({ roomId, isHost, onClose }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [studyLength, setStudyLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [breakTime, setBreakTime] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const completionSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

  useEffect(() => {
    const savedStudyLength = localStorage.getItem('studyLength');
    const savedBreakLength = localStorage.getItem('breakLength');
    const savedRounds = localStorage.getItem('rounds');

    if (savedStudyLength) setStudyLength(parseInt(savedStudyLength));
    if (savedBreakLength) setBreakLength(parseInt(savedBreakLength));
    if (savedRounds) setRounds(parseInt(savedRounds));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('studyLength', studyLength);
    localStorage.setItem('breakLength', breakLength);
    localStorage.setItem('rounds', rounds);
  };

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      console.error("onClose is not a function");
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  const validateTimeInput = (time, type) => {
    if (time.hours < 0 || time.hours > 99) {
      setErrorMessage(`Invalid ${type} hours. Please enter a value between 0 and 99.`);
      return false;
    }
    if (time.minutes < 0 || time.minutes > 59) {
      setErrorMessage(`Invalid ${type} minutes. Please enter a value between 0 and 59.`);
      return false;
    }
    if (time.seconds < 0 || time.seconds > 59) {
      setErrorMessage(`Invalid ${type} seconds. Please enter a value between 0 and 59.`);
      return false;
    }
    return true;
  };

  const startTimer = () => {
    if (!validateTimeInput(studyTime, 'study') || !validateTimeInput(breakTime, 'break')) {
      return;
    }

    if (studyTime.hours === 0 && studyTime.minutes === 0 && studyTime.seconds === 0) {
      setErrorMessage('Focus time input is empty.');
      return;
    }
    if (breakTime.hours === 0 && breakTime.minutes === 0 && breakTime.seconds === 0) {
      setErrorMessage('Break time input is empty.');
      return;
    }

    const totalStudySeconds = (
      studyTime.hours * 3600 + 
      studyTime.minutes * 60 + 
      studyTime.seconds
    );
    
    const totalBreakSeconds = (
      breakTime.hours * 3600 + 
      breakTime.minutes * 60 + 
      breakTime.seconds
    );

    setTimeLeft(totalStudySeconds);
    setStudyLength(totalStudySeconds);
    setBreakLength(totalBreakSeconds);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setCurrentPage('timer');
  };

  const onMouseDown = (e) => {
    if (e.target.className.includes('timer-handle')) {
      setDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const onMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, dragOffset]);

  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak && currentRound >= rounds) {
        // All rounds completed - including the current one
        setIsRunning(false);
        setCurrentPage('completed');
        if (playSound) {
          completionSound.play();
        }
        return;
      }
      
      if (playSound) {
        completionSound.play(); // Play sound at the end of each period
      }
      
      if (!isBreak) {
        // If not on break, switch to break
        setIsBreak(true);
        setTimeLeft(breakLength);
        setCurrentRound((prevRound) => prevRound + 1);
      } else {
        // If on break, switch back to study
        setIsBreak(false);
        setTimeLeft(studyLength);
      }
    }
  
    return () => clearInterval(timer);
  }, [isRunning, isPaused, timeLeft, isBreak, studyLength, breakLength, rounds, playSound, currentRound]);

  const renderContent = () => {
    if (currentPage === 'completed') {
      return (
        <div className="p-4 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
          <div className="flex-grow flex flex-col items-center px-8">
            <div className="text-2xl mt-8 text-center" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
              Well done!
              <br />
              Here, have a blueberry
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="w-full mb-4">
              <button
                onClick={() => {
                  setCurrentPage('welcome');
                  setCurrentRound(1);
                  setIsBreak(false);
                  setTimeLeft(studyLength);
                  setIsRunning(false);
                }}
                className="w-full px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm"
                style={{ 
                  backgroundColor: '#d1cbed', 
                  fontFamily: '"Press Start 2P", monospace',
                  transition: 'background-color 0.3s, transform 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8e99e3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1cbed';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!isRunning) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-2xl" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
            Set Your Study Timer
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Study Time</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={studyTime.hours}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 99) {
                      setStudyTime({...studyTime, hours: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="99"
                  placeholder="HH"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={studyTime.minutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 59) {
                      setStudyTime({...studyTime, minutes: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={studyTime.seconds}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 59) {
                      setStudyTime({...studyTime, seconds: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Break Time</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={breakTime.hours}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 99) {
                      setBreakTime({...breakTime, hours: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="99"
                  placeholder="HH"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={breakTime.minutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 59) {
                      setBreakTime({...breakTime, minutes: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={breakTime.seconds}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0 && value <= 59) {
                      setBreakTime({...breakTime, seconds: value});
                    }
                  }}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Rounds</label>
              <div className="mt-1">
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value))}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="relative">
                <input
                  type="checkbox"
                  id="soundToggle"
                  checked={playSound}
                  onChange={(e) => setPlaySound(e.target.checked)}
                  className="sr-only"
                />
                <div 
                  onClick={() => setPlaySound(!playSound)}
                  className="w-6 h-6 border-2 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ 
                    borderColor: '#d1cbed', 
                    backgroundColor: '#F0F3FC',
                    boxShadow: playSound ? 'inset 0 0 5px rgba(209, 203, 237, 0.5)' : 'none',
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    minHeight: '24px'
                  }}
                >
                  {playSound && (
                    <span 
                      role="img" 
                      aria-label="lavender" 
                      style={{ 
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      💜
                    </span>
                  )}
                </div>
              </div>
              <label 
                htmlFor="soundToggle" 
                style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }}
                className="cursor-pointer"
              >
                Play sound when timer ends
              </label>
            </div>
          </div>

          <div className="w-full px-4">
            <button
              onClick={startTimer}
              className="w-full mt-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm"
              style={{ 
                backgroundColor: '#d1cbed', 
                fontFamily: '"Press Start 2P", monospace',
                transition: 'background-color 0.3s, transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8e99e3';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d1cbed';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Start Timer
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="text-[#FFB5C5] text-2xl mt-8" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          {isBreak ? 'Break Time!' : 'Lock in or else!'}
        </div>

        <div className="text-[48px] font-bold text-[#FFB5C5] mb-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          {formatTime(timeLeft)}
        </div>

        <div style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-4">
          Round {currentRound}/{rounds}
        </div>

        <div className="flex justify-center items-center mb-4 px-4">
          <button 
            onClick={handleBack}
            className="hover:text-[#bac6f1] transition-colors duration-200"
            style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#d1cbed' }}
          >
            ⬅
          </button>
          <div className="flex gap-4 mx-4">
            <button 
              onClick={toggleTimer}
              style={{
                backgroundColor: '#d1cbed',
                color: 'white',
                fontFamily: 'VT323, monospace',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s, transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8e99e3';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d1cbed';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button 
              onClick={resetTimer}
              style={{
                backgroundColor: '#d1cbed',
                color: 'white',
                fontFamily: 'VT323, monospace',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s, transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8e99e3';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d1cbed';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </>
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const unsubscribe = onValue(ref(database, `rooms/${roomId}/timer`), (snapshot) => {
      const data = snapshot.val();
      if (!data && isHost) {
        // Initialise data if it doesn't exist
      } else if (data) {
        // Update local state with Firebase data
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [roomId, isHost]);

  const toggleTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    const totalStudySeconds = (
      studyTime.hours * 3600 + 
      studyTime.minutes * 60 + 
      studyTime.seconds
    );
    
    setTimeLeft(totalStudySeconds);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleBack = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(studyLength * 60);
    setCurrentRound(1);
    setIsBreak(false);
  };

  const clearError = () => {
    setErrorMessage('');
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000); // 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const errorMessageAnimation = `
    @keyframes dissolveIn {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
      <style>{errorMessageAnimation}</style>
      {/* Error message positioned abovethe timer */}
      {errorMessage && (
        <div 
          className="fixed p-3 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: '#e2e8ff',
            borderBottom: '2px solid rgba(209, 203, 237, 0.5)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(186, 198, 241, 0.2)',
            width: '300px',
            animation: 'dissolveIn 0.3s ease-out forwards',
            top: `${position.y - 50}px`,
            left: `${position.x}px`,  
            transform: 'translateX(10px)',  
            pointerEvents: 'auto',
            margin: '0 auto',  
            right: 'auto',
            marginLeft: '10px',  
          }}
        >
          <span 
            style={{ 
              color: '#99a8c7', 
              fontFamily: 'VT323, monospace',
              fontSize: '18px'
            }}
          >
            {errorMessage}
          </span>
        </div>
      )}
      
      <div 
        style={{ 
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: dragging ? 'grabbing' : 'grab',
          backgroundColor: '#F0F3FC',
          border: '4px solid #E2E8FF',
          boxShadow: '0 0 10px #E2E8FF, inset 0 0 10px #E2E8FF, 0 0 20px rgba(226, 232, 255, 0.4), 0 0 30px rgba(186, 198, 241, 0.2)',
          filter: 'blur(0.3px)',
          outline: '4px solid rgba(186, 198, 241, 0.3)',
          outlineOffset: '4px',
          WebkitFilter: 'drop-shadow(0 0 40px rgba(186, 198, 241, 0.4))',
          pointerEvents: 'auto'
        }}
        className="timer-handle relative"
        onMouseDown={onMouseDown}
      >
        {currentPage === 'completed' ? (
          <div className="p-4 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
            <div className="flex-grow flex flex-col items-center px-8">
              <div className="text-2xl mt-8 text-center" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                Well done!
                <br />
                Here, have a blueberry
              </div>
              
              <div className="flex-grow"></div>
              
              <div className="w-full mb-4">
                <button
                  onClick={() => {
                    setCurrentPage('welcome');
                    setCurrentRound(1);
                    setIsBreak(false);
                    setTimeLeft(studyLength);
                    setIsRunning(false);
                  }}
                  className="w-full px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm"
                  style={{ 
                    backgroundColor: '#d1cbed', 
                    fontFamily: '"Press Start 2P", monospace',
                    transition: 'background-color 0.3s, transform 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8e99e3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1cbed';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        ) : !isRunning ? (
          <div className="p-4 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
            <div className="timer-handle mb-2 px-8 mt-2">
              <h1 className="text-2xl" style={{ color: '#b2b2b2', fontFamily: 'VT323, monospace' }}>Study Timer</h1>
            </div>
            
            <div className="flex flex-col items-center px-8">
              <div className="text-2xl mb-4" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                Set Your Study Timer
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Study Time</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={studyTime.hours}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 99) {
                          setStudyTime({...studyTime, hours: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="99"
                      placeholder="HH"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.minutes}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                          setStudyTime({...studyTime, minutes: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.seconds}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                          setStudyTime({...studyTime, seconds: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Break Time</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={breakTime.hours}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 99) {
                          setBreakTime({...breakTime, hours: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="99"
                      placeholder="HH"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.minutes}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                          setBreakTime({...breakTime, minutes: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.seconds}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                          setBreakTime({...breakTime, seconds: value});
                        }
                      }}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Rounds</label>
                  <div className="mt-1">
                    <input
                      type="number"
                      value={rounds}
                      onChange={(e) => setRounds(parseInt(e.target.value))}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="soundToggle"
                      checked={playSound}
                      onChange={(e) => setPlaySound(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      onClick={() => setPlaySound(!playSound)}
                      className="w-6 h-6 border-2 rounded-lg flex items-center justify-center cursor-pointer"
                      style={{ 
                        borderColor: '#d1cbed', 
                        backgroundColor: '#F0F3FC',
                        boxShadow: playSound ? 'inset 0 0 5px rgba(209, 203, 237, 0.5)' : 'none',
                        width: '24px',
                        height: '24px',
                        minWidth: '24px',
                        minHeight: '24px'
                      }}
                    >
                      {playSound && (
                        <span 
                          role="img" 
                          aria-label="lavender" 
                          style={{ 
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          💜
                        </span>
                      )}
                    </div>
                  </div>
                  <label 
                    htmlFor="soundToggle" 
                    style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }}
                    className="cursor-pointer"
                  >
                    Play sound when timer ends
                  </label>
                </div>
              </div>

              <div className="w-full px-4">
                <button
                  onClick={startTimer}
                  className="w-full mt-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm"
                  style={{ 
                    backgroundColor: '#d1cbed', 
                    fontFamily: '"Press Start 2P", monospace',
                    transition: 'background-color 0.3s, transform 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8e99e3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1cbed';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Start Timer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
            <div className="timer-handle mb-6 px-8 mt-2 flex justify-between items-center">
              <h1 className="text-2xl" style={{ color: '#b2b2b2', fontFamily: 'VT323, monospace' }}>Study Timer</h1>
              <button 
                onClick={handleBack}
                className="transition-colors duration-200"
                style={{ 
                  fontFamily: 'VT323, monospace', 
                  fontSize: '24px', 
                  color: '#d1cbed',
                  marginRight: '-8px',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.3s, transform 0.3s, color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8e99e3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d1cbed';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ⬅
              </button>
            </div>
            
            <div className="flex-grow flex flex-col items-center px-8">
              <div className="text-2xl mb-6" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                {isBreak ? 'Break Time!' : 'Lock in or else!'}
              </div>
              
              <div className="text-[48px] font-bold mb-6" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                {formatTime(timeLeft)}
              </div>

              <div style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-4">
                Round {currentRound}/{rounds}
              </div>

              <div className="flex-grow"></div>

              <div className="flex justify-center w-full mb-4">
                <div className="flex gap-4">
                  <button 
                    onClick={toggleTimer}
                    style={{
                      backgroundColor: '#d1cbed',
                      color: 'white',
                      fontFamily: 'VT323, monospace',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      transition: 'background-color 0.3s, transform 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#8e99e3';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d1cbed';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button 
                    onClick={resetTimer}
                    style={{
                      backgroundColor: '#d1cbed',
                      color: 'white',
                      fontFamily: 'VT323, monospace',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      transition: 'background-color 0.3s, transform 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#8e99e3';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d1cbed';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
