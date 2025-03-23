import React, { useState, useEffect } from 'react'; 
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { database } from '../firebase-config';
import 'tailwindcss';
import '@fontsource/vt323';
import '@fontsource/press-start-2p';

const StudyTimer = ({ roomId, isHost, onClose, "data-testid": dataTestId }) => {
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

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            if (playSound) {
              completionSound.play();
            }
            
            if (!isBreak) {
              if (currentRound >= rounds) {
                setCurrentPage('completed');
                setIsRunning(false);
                return 0;
              }
              setIsBreak(true);
              return breakLength;
            } else {
              setCurrentRound(prev => prev + 1);
              setIsBreak(false);
              return studyLength;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isBreak, currentRound, rounds, breakLength, studyLength, playSound]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      }, 3000);
      
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
    <div className="study-timer-container">
      <style>
        {`
          ${errorMessageAnimation}
          
          .study-timer-container {
            width: 100% ;
            height: 100% ;
            display: flex ;
            justify-content: center ;
            align-items: center ;
          }
          
          .study-timer-wrapper {
            background-color: #F0F3FC ;
            border: 4px solid #E2E8FF ;
            padding: 20px ;
            border-radius: 30px ;
            box-shadow: 0 0 10px #E2E8FF, inset 0 0 10px #E2E8FF, 0 0 20px rgba(226, 232, 255, 0.4), 0 0 30px rgba(186, 198, 241, 0.2) ;
            filter: blur(0.3px) ;
            outline: 4px solid rgba(186, 198, 241, 0.3) ;
            outline-offset: 4px ;
            -webkit-filter: drop-shadow(0 0 40px rgba(186, 198, 241, 0.4)) ;
            z-index: 900 ;
            width: 315px ;
            height: 370px ;
            display: flex ;
            flex-direction: column ;
            align-items: center ;
            margin: 0 auto ;
          }

          .study-timer-wrapper .vt323 {
            font-family: "VT323", monospace ;
          }

          .study-timer-wrapper .press-start {
            font-family: "Press Start 2P", monospace ;
          }

          .study-timer-wrapper input[type="number"] {
            width: 3rem ;
            height: 2.5rem ;
            text-align: center ;
            border: 2px solid #d1cbed ;
            border-radius: 8px ;
            background-color: transparent ;
            color: #b2b2b2 ;
            font-family: "Press Start 2P", monospace ;
            font-size: 0.875rem ;
            margin: 0 0.5rem ;
            outline: none ;
          }

          .study-timer-wrapper input[type="number"]:focus {
            border-color: #bac6f1 ;
          }

          .study-timer-wrapper .input-label {
            font-family: "VT323", monospace ;
            color: #d1cbed ;
          }

          .study-timer-wrapper .start-timer-button {
            font-family: "Press Start 2P", monospace ;
            background-color: #d1cbed ;
            color: white ;
            width: 80% ;
            padding: 0.5rem ;
            border-radius: 0.5rem ;
            font-size: 0.875rem ;
            margin-top: 1rem ;
            text-align: center ;
            transition: background-color 0.3s, transform 0.3s ;
          }

          .study-timer-wrapper .start-timer-button:hover {
            background-color: #8e99e3 ;
            transform: scale(1.05) ;
          }

          .study-timer-wrapper .timer-title {
            font-family: "VT323", monospace ;
            color: #b2b2b2 ;
          }

          .study-timer-wrapper .timer-subtitle {
            font-family: "Press Start 2P", monospace ;
            color: #bac6f1 ;
          }
        `}
      </style>
      
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
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            margin: '0 auto'
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
      
      <div className="study-timer-wrapper">
        <div className="timer-content">
          {currentPage === 'completed' ? (
            <div className="p-4 w-80 flex flex-col bg-[#F0F3FC] timer-handle" style={{ height: "350px", position: "relative" }}>
              <div className="text-2xl mt-8 text-center" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                Well done!
                <br />
                Here, have a blueberry
              </div>
              
              <div style={{ 
                position: "absolute", 
                bottom: "10px",
                left: "0", 
                width: "100%",
                padding: "0 10px 20px 10px"
              }}>
                <button
                  onClick={() => {
                    setCurrentPage('welcome');
                    setCurrentRound(1);
                    setIsBreak(false);
                    setTimeLeft(studyLength);
                    setIsRunning(false);
                  }}
                  className="w-full text-white rounded-lg"
                  style={{ 
                    backgroundColor: '#d1cbed', 
                    fontFamily: '"Press Start 2P", monospace',
                    transition: 'background-color 0.3s, transform 0.3s',
                    color: 'white',
                    borderRadius: '0.5rem',
                    padding: '12px 4px',
                    fontSize: '15px'
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
          ) : !isRunning ? (
            <div className="p-4 w-80 min-height flex flex-col bg-[#F0F3FC] timer-handle">
              <div className="flex flex-col items-center px-8">
                <div className="text-2xl mb-4 press-start" style={{ color: '#bac6f1' }}>
                  Set Your Study Timer
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex flex-col items-center space-y-2">
                    <label className="input-label" style={{ 
                      color: '#d1cbed',
                      fontSize: '20px'
                    }}>Study Time</label>
                    <div className="flex justify-center gap-4">
                      <input
                        type="number"
                        value={studyTime.hours}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 99) {
                            setStudyTime({...studyTime, hours: value});
                          }
                        }}
                        min="0"
                        max="99"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={studyTime.minutes}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setStudyTime({...studyTime, minutes: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={studyTime.seconds}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setStudyTime({...studyTime, seconds: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <label className="input-label" style={{ 
                      color: '#d1cbed',
                      fontSize: '20px'
                    }}>Break Time</label>
                    <div className="flex justify-center gap-4">
                      <input
                        type="number"
                        value={breakTime.hours}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 99) {
                            setBreakTime({...breakTime, hours: value});
                          }
                        }}
                        min="0"
                        max="99"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={breakTime.minutes}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setBreakTime({...breakTime, minutes: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={breakTime.seconds}
                        onChange={(e) => {
                          const                           value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setBreakTime({...breakTime, seconds: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center" style={{ width: 'auto', position: 'relative' }}>
                    <label className="input-label" style={{ 
                      color: '#d1cbed',
                      fontSize: '20px'
                    }}>Rounds</label>
                    
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0' }}>
                      <input
                        type="number"
                        value={rounds}
                        onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                        min="1"
                        placeholder="4"
                        style={{ width: '3rem' }}
                      />
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        marginLeft: '0',
                        position: 'absolute',
                        left: '5rem'
                      }}>
                        <button
                          onClick={(e) => setPlaySound(!playSound)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {playSound ? '💜' : '🤍'}
                        </button>
                        <span className="input-label" style={{ 
                          color: '#d1cbed',
                          fontSize: '20px',
                          marginLeft: '10px',
                          width: '150px',
                          lineHeight: '1.2',
                          textAlign: 'left'
                        }}>
                          Play sound when timer ends
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full px-4" style={{ marginTop: '10px' }}>
                  <button
                    onClick={startTimer}
                    className="start-timer-button"
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
            <div className="p-4 w-80 min-height bg-[#F0F3FC] timer-handle" style={{ height: '370px', position: 'relative' }}>
              <div className="absolute w-full" style={{
                top: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'row',
                flexWrap: 'nowrap'
              }}>
                <button 
                  onClick={handleBack}
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '20px',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector('.triangle').style.borderRightColor = '#8e99e3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector('.triangle').style.borderRightColor = '#d1cbed';
                  }}
                >
                  <div 
                    className="triangle" 
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderRight: '12px solid #d1cbed',
                      borderBottom: '8px solid transparent',
                      transition: 'border-right-color 0.3s'
                    }}
                  />
                </button>
                
                <h2 className="press-start" style={{ 
                  color: '#bac6f1',
                  fontSize: '20px',
                  lineHeight: 1.2,
                  margin: 0,
                  textAlign: 'center',
                  display: 'inline-block',
                  minHeight: '48px',
                  paddingTop: '0px'
                }}>
                  {isBreak ? (
                    <>
                      Break<br />
                      Time!
                    </>
                  ) : (
                    <>
                      Lock in<br />
                      or else!
                    </>
                  )}
                </h2>
              </div>
              
              <div className="absolute w-full" style={{
                bottom: '140px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <div style={{ 
                  color: '#bac6f1',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '50px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '50px',
                left: '0',
                right: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 24px'
              }}>
                <div style={{ 
                  width: '100%',
                  marginBottom: '15px',
                  textAlign: 'center',
                  transform: 'translateY(10px)',
                  position: 'relative',
                }}>
                  <span style={{ 
                    color: '#d1cbed', 
                    fontFamily: 'VT323, monospace',
                    fontSize: '20px',
                    display: 'block',
                    paddingTop: '5px'
                  }}>
                    Round {currentRound}/{rounds}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  width: '100%'
                }}>
                  <button 
                    onClick={toggleTimer}
                    style={{
                      backgroundColor: '#d1cbed',
                      color: 'white',
                      fontFamily: 'VT323, monospace',
                      padding: '10px 0',
                      width: '110px',
                      height: '45px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      transition: 'background-color 0.3s, transform 0.3s',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
                    <span style={{ fontSize: '22px' }}>
                      {isPaused ? 'Resume' : 'Pause'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={resetTimer}
                    style={{
                      backgroundColor: '#d1cbed',
                      color: 'white',
                      fontFamily: 'VT323, monospace',
                      padding: '10px 0',
                      width: '110px',
                      height: '45px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      transition: 'background-color 0.3s, transform 0.3s',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
                    <span style={{ fontSize: '22px' }}>
                      Reset
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
