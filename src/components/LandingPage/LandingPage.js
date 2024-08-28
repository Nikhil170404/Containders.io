import React from 'react';
import './LandingPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faGamepad, faUsers, faStar, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <h1>Welcome to the Ultimate Esports Platform</h1>
        <p>Experience thrilling esports tournaments and join a global gaming community.</p>
        <div className="cta-buttons">
          <a href="/register" className="cta-button primary">Get Started</a>
          <a href="/learn-more" className="cta-button secondary">Learn More</a>
        </div>
      </section>
      
      <section className="info-section">
        <div className="info-card">
          <FontAwesomeIcon icon={faTrophy} className="info-icon" />
          <h2>Compete and Win</h2>
          <p>Join our tournaments and showcase your skills for exciting rewards!</p>
        </div>
        <div className="info-card">
          <FontAwesomeIcon icon={faGamepad} className="info-icon" />
          <h2>Game Categories</h2>
          <p>Explore diverse game categories from FPS to MOBA and find your match.</p>
        </div>
        <div className="info-card">
          <FontAwesomeIcon icon={faUsers} className="info-icon" />
          <h2>Join the Community</h2>
          <p>Connect with gamers worldwide, form teams, and share your victories.</p>
        </div>
      </section>

      <section className="game-of-the-week">
        <h2>Game of the Week</h2>
        <div className="game-card">
          <img src="/src/game-of-the-week.jpg" alt="Game of the Week" className="game-image" />
          <div className="game-info">
            <h3>Battle Royale Legends</h3>
            <p>Join the most exciting game of the week and compete for amazing rewards!</p>
            <a href="/game-of-the-week" className="cta-button primary">Play Now</a>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <h2>Stay Updated</h2>
        <p>Sign up for our newsletter to receive exclusive updates and offers.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit" className="cta-button primary">Subscribe</button>
        </form>
      </section>
      
      <section className="testimonials">
        <h2>What Our Players Say</h2>
        <div className="testimonial-card">
          <p>"The best platform for competitive gaming. Love the tournaments and community!"</p>
          <h4>– Alex M.</h4>
        </div>
        <div className="testimonial-card">
          <p>"Great experience with a wide range of games and a fantastic user interface."</p>
          <h4>– Jamie L.</h4>
        </div>
      </section>
      
      <footer className="footer">
        <p>&copy; 2024 Esports Platform. All rights reserved.</p>
        <div className="footer-links">
          <a href="/about" className="footer-link">About Us</a>
          <a href="/contact" className="footer-link">Contact</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
