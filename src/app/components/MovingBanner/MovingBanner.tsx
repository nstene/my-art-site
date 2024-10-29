"use client"; // enable usage of useState hook
import React, {useState, useEffect} from 'react';
import styles from './MovingBanner.module.css'; // Import CSS module

const MovingBanner = () => {
    const [message, setMessage] = useState('');

    useEffect( () => {
        // Get time and date from the machine where the code is running
        const updateMessage = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();
            setMessage(`${dateString}    ${timeString}`);
        };

        // update message initially and every second
        updateMessage();
        const intervalID = setInterval(updateMessage, 1000)
        
        return () => clearInterval(intervalID)
    }, []);

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        {message}
      </div>
    </div>
  );
};

export default MovingBanner;
