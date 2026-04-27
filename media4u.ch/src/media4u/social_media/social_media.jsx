// src/components/ui/SocialMedia.jsx
import React from 'react';
import "./social_media.css";

import FacebookIcon from '../../icons/square-facebook-brands.svg';
import InstagramIcon from '../../icons/square-instagram-brands.svg';
import XIcon from '../../icons/square-x-twitter-brands.svg';
import RedditIcon from '../../icons/square-reddit-brands.svg';
import BehanceIcon from '../../icons/square-behance-brands.svg';
import PinterestIcon from '../../icons/square-pinterest-brands.svg';
import TumblrIcon from '../../icons/square-tumblr-brands.svg';
import RednoteIcon from '../../icons/square-rednote-brands.png';
import LinkedInIcon from '../../icons/square-linkedin.svg';

// Konfiguration der Social-Media-Ressourcen
const SOCIAL_MEDIA = Object.freeze([
  { name: 'Facebook', icon: FacebookIcon, url: 'https://www.facebook.com/profile.php?id=100071208752195' },
  { name: 'Instagram', icon: InstagramIcon, url: 'https://www.instagram.com/media4u.ch/' },
  { name: 'X-Twitter', icon: XIcon, url: 'https://x.com/media4u_ch?s=11&t=tGCEAI7LHBO2i7NSAb60tA' },
  { name: 'Reddit', icon: RedditIcon, url: 'https://reddit.com/u/media4u_ch/s/zgRgBIOwTm' },
  { name: 'Behance', icon: BehanceIcon, url: 'https://www.behance.net/romanmessmer' },
  { name: 'Pinterest', icon: PinterestIcon, url: 'https://pin.it/7zn1Q6u2J' },
  { name: 'Tumblr', icon: TumblrIcon, url: 'https://www.tumblr.com/media4u-ch' },
  { name: 'Rednote', icon: RednoteIcon, url: 'https://www.xiaohongshu.com/user/profile/6787f383000000000801b574?...' },
  { name: 'LinkedIn', icon: LinkedInIcon, url: 'https://www.linkedin.com/in/roman-messmer-8b0852391/' }
]);

// Hauptkomponente: Rendert die Social-Media-Links
const SocialMedia = () => {
  return (
    <div className="social_media">
      {SOCIAL_MEDIA.map(({ name, icon, url }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="social_media__link"
          aria-label={name}
        >
          <img src={icon} alt="" className="social_media__icon" width="24" height="24" />
          <span className="social_media__name">{name}</span>
        </a>
      ))}
    </div>
  );
};

export default SocialMedia;