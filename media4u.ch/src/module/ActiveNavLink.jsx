import React from 'react';
import { useLocation } from 'react-router-dom'; // Für Zugriff auf den aktuellen Pfad
import NavSubAsciiArtFilm from "./nav_sub/nav_sub_ascii_art_film";
import NavSubMedia4u from "./nav_sub/nav_sub_media4u";
import NavSubSmsTextbild from "./nav_sub/nav_sub_sms_textbild";
import NavSubTextbild2 from "./nav_sub/nav_sub_textbild2";

const ActiveNavLink = () => {
  const location = useLocation(); // Aktueller Pfad

  // Funktion zur Auswahl des passenden Untermenüs
  const renderSubMenu = () => {
    if (location.pathname.startsWith('/media4u')) {
      return <NavSubMedia4u />;
    }
    if (location.pathname.startsWith('/sms_textbild')) {
      return <NavSubSmsTextbild />;
    }
    if (location.pathname.startsWith('/textbild2')) {
      return <NavSubTextbild2 />;
    }
    if (location.pathname.startsWith('/ascii_art_film')) {
      return <NavSubAsciiArtFilm />;
    }
    return null; // Kein Untermenü anzeigen
  };

  return (
    <>
      {renderSubMenu()}
    </>
  );
};

export default ActiveNavLink;
