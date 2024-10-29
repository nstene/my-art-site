import React from 'react';
import styles from './MovingBanner.module.css'; // Import CSS module

const MovingBanner = () => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        This is a moving banner! 🎉 Stay tuned for updates and promotions!
      </div>
    </div>
  );
};

export default MovingBanner;
