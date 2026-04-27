// src/components/layout/Header.jsx
import React from "react";
import Logo from "./logo";
import Slogan from "./slogan";
import "./header.css";

// Hauptkomponente: Container für Logo und Slogan
const Header = () => {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <Logo />
        <Slogan />
      </div>
    </header>
  );
};

export default Header;