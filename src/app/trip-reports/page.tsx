"use client"; // enable usage of useState hook
import React, {useState} from "react";

const TripReportsPage = () => {
    const [inputPassword, setInputPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handlePasswordSubmit = () => {
        const correctPassword = 'curiosity';
        if (inputPassword === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password. Please try again.')
        }
    };

    // Detect Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePasswordSubmit(); // Call the submit function
        }
    };

    if (isAuthenticated) {
        // render protected content if authenticated
        return (
            <div>
              <h1>Welcome to the Protected Page!</h1>
              <p>This content is password-protected.</p>
              {/* Add the rest of your page content here */}
            </div>
          );
    }

    // Render password input if not authenticated
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
        }}>
            <div style={{
                padding: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
            }}>
            <h2>Enter Password to Access This Page</h2>
            <input
                type="password"
                placeholder="Enter password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    padding: '8px',
                    margin: '10px 0',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
            />
            <button onClick={handlePasswordSubmit} style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            }}>
                Submit
            </button>
            </div>
        </div>
    );
};

export default TripReportsPage