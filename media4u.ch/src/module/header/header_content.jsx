// Header_Content.jsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header_Media4u from "./header_media4u";
import Header_SMS_Textbild from "./header_sms_textbild";
import Header_Textbild2 from "./header_textbild2";
import Header_Ascii_Art_Film from "./header_ascii_art_film";

const Header_Content = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const headerComponent = useMemo(() => {
    if (path.startsWith("/media4u")) {
      return <Header_Media4u />;
    } else if (path.startsWith("/sms_textbild")) {
      return <Header_SMS_Textbild />;
    } else if (path.startsWith("/textbild2")) {
      return <Header_Textbild2 />;
    } else if (path.startsWith("/ascii_art_film")) {
      return <Header_Ascii_Art_Film />;
    }
    return null;
  }, [path]);

  return (
    <div className="header_content">
      {headerComponent}
    </div>
  );
};

export default Header_Content;
