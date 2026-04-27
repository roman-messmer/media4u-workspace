import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

// i18next
import { useTranslation } from 'react-i18next';
import './i18n'; // Deine i18n-Konfiguration


// Globale Styles
import './css/index.css'; // Dein globales CSS
import './fonts/fonts.css'; // Deine Schrift-Imports
import './module/nav_sub/background_colors.css'; // Globale Hintergrundfarben

// Komponenten-Importe
import Sprachen from './module/sprachen/sprachen';
import NavMain from './module/nav_main/nav_main';
import NavSub from './module/nav_sub/nav_sub';
import Header from './module/header/header';
import Footer from './module/footer/footer';
import Content from './main_routes/main_routes';

import Rechtliches from './media4u/rechtliches/rechtliches';
import SocialMedia from "./media4u/social_media/social_media";

import Media4u from './media4u/media4u/media4u';
import Werbepartner from './media4u/werbepartner/werbepartner';
import Mehr_Info from './media4u/werbepartner/mehr_info';
import AffiliateMarketing from './media4u/affiliate_marketing/affiliate_marketing';
import FrontEndDeveloper from './media4u/front_end_developer/front_end_developer';
import Kontakt from './media4u/kontakt/kontakt';
import Impressum from './media4u/impressum/impressum';
import Datenschutz from './media4u/datenschutz/datenschutz';
import Cookie from './media4u/cookie/cookie';
import Agb from './media4u/agb/agb';

import SmsTextbild from './sms_textbild/sms_textbild';
import Neu from './sms_textbild/neu';
import LiebeFreundschaft from './sms_textbild/liebe_freundschaft';
import FesttageParty from './sms_textbild/festtage_party';
import FreizeitArbeit from './sms_textbild/freizeit_arbeit';
import SportHobby from './sms_textbild/sport_hobby';
import AbenteuerAction from './sms_textbild/abenteuer_action';
import ErotikSex from './sms_textbild/erotik_sex';

import Textbild2 from './textbild2/textbild2';
import Neu2 from './textbild2/neu2';
import LiebeFreundschaft2 from './textbild2/liebe_freundschaft2';
import FesttageParty2 from './textbild2/festtage_party2';
import FreizeitArbeit2 from './textbild2/freizeit_arbeit2';
import SportHobby2 from './textbild2/sport_hobby2';
import AbenteuerAction2 from './textbild2/abenteuer_action2';
import ErotikSex2 from './textbild2/erotik_sex2';

import AsciiFilm from './ascii_art_film/ascii_art_film';
import Matrix from './ascii_art_film/matrix/matrix';

import Anker from "./module/anker/anker";


// ----------------------------------------------------
// 3. Hook zum dynamischen Setzen von Klassen für Header, NavSub und Footer
// ----------------------------------------------------
function useDynamicClasses() {
  const location = useLocation();

  useEffect(() => {
    console.log("Aktuelle Route:", location.pathname); // Debugging

    // Elemente abrufen
    const header = document.querySelector(".wrapper_header");
    const navSub = document.querySelector(".wrapper_nav_sub");
    const footer = document.querySelector(".wrapper_footer");

    if (!header || !navSub || !footer) {
      console.warn("Ein oder mehrere Elemente nicht gefunden!");
      return;
    }

    // Alle möglichen Hintergrund-Klassen entfernen
    const classesToRemove = [
      "header_bg_media4u", "header_bg_sms_textbild", "header_bg_textbild2", "header_bg_matrix",
      "bg_media4u", "bg_sms_textbild", "bg_textbild2", "bg_ascii_art_film"
    ];

    [header, navSub, footer].forEach((element) =>
      element.classList.remove(...classesToRemove)
    );

    // Hintergrundklassen für die jeweiligen Seiten setzen
    if (location.pathname.startsWith("/media4u")) {
      header.classList.add("header_bg_media4u");
      navSub.classList.add("bg_media4u");
      footer.classList.add("bg_media4u");
    } else if (location.pathname.startsWith("/sms_textbild")) {
      header.classList.add("header_bg_sms_textbild");
      navSub.classList.add("bg_sms_textbild");
      footer.classList.add("bg_sms_textbild");
    } else if (location.pathname.startsWith("/textbild2")) {
      header.classList.add("header_bg_textbild2");
      navSub.classList.add("bg_textbild2");
      footer.classList.add("bg_textbild2");
    } else if (location.pathname.startsWith("/ascii_art_film")) {
      header.classList.add("header_bg_matrix");
      navSub.classList.add("bg_ascii_art_film");
      footer.classList.add("bg_ascii_art_film");
    }

    console.log("Neue Klassen gesetzt:", {
      header: header.classList,
      navSub: navSub.classList,
      footer: footer.classList
    });

  }, [location]);
}

// ----------------------------------------------------
// 4. AppContent-Komponente
// ----------------------------------------------------
function AppContent() {
  const { t } = useTranslation();

  // A) Hintergrund-Klassen-Hook
  useDynamicClasses();


  return (
    <div id="anker">
      {/* Sprachen-Auswahl */}
      <div className="wrapper wrapper_sprachen">
        <div className="container container_sprachen">
          <Sprachen />
        </div>
      </div>

      {/* Header-Bereich ohne zusätzliche Hintergrund-DIVs */}
      <div className="wrapper wrapper_header">
        <div className="header_bg"></div>
        <header className="container container_header">
          <Header />
        </header>
      </div>

      {/* Haupt-Navigation */}
      <div className="wrapper wrapper_nav_main">
        <nav className="container container_nav_main">
          <NavMain />
        </nav>
      </div>

      {/* Sub-Navigation */}
      <div className="wrapper wrapper_nav_sub">
        <nav className="container container_nav_sub">
          <NavSub />
        </nav>
      </div>

      {/* Haupt-Content */}
      <div className="wrapper wrapper_content">
        <main className="container container_content">
          <Routes>
            {/* Umleitung von "/" nach "/media4u" */}
            <Route path="/" element={<Navigate to="/media4u" replace />} />

            {/* Render für alle anderen Pfade zuerst: */}
            <Route path="*" element={<Content />} />

            {/* media4u */}
            <Route path="/media4u" element={<Media4u />} />
            <Route path="/media4u/werbepartner" element={<Werbepartner />} />
            <Route path="/media4u/mehr_info" element={<Mehr_Info />} />
            <Route
              path="/media4u/affiliate_marketing"
              element={<AffiliateMarketing />}
            />
            <Route
              path="/media4u/front_end_developer"
              element={<FrontEndDeveloper />}
            />
            <Route path="/media4u/kontakt" element={<Kontakt />} />
            <Route path="/media4u/impressum" element={<Impressum />} />
            <Route path="/media4u/datenschutz" element={<Datenschutz />} />
            <Route path="/media4u/cookie" element={<Cookie />} />
            <Route path="/media4u/agb" element={<Agb />} />

            {/* sms_textbild */}
            <Route path="/sms_textbild" element={<SmsTextbild />} />
            <Route path="/sms_textbild/neu" element={<Neu />} />
            <Route
              path="/sms_textbild/liebe_freundschaft"
              element={<LiebeFreundschaft />}
            />
            <Route
              path="/sms_textbild/liebe_freundschaft/:displayId"
              element={<LiebeFreundschaft />}
            />
            <Route
              path="/sms_textbild/festtage_party"
              element={<FesttageParty />}
            />
            <Route
              path="/sms_textbild/festtage_party/:displayId"
              element={<FesttageParty />}
            />
            <Route
              path="/sms_textbild/freizeit_arbeit"
              element={<FreizeitArbeit />}
            />
            <Route
              path="/sms_textbild/freizeit_arbeit/:displayId"
              element={<FreizeitArbeit />}
            />
            <Route path="/sms_textbild/sport_hobby" element={<SportHobby />} />
            <Route
              path="/sms_textbild/sport_hobby/:displayId"
              element={<SportHobby />}
            />
            <Route
              path="/sms_textbild/abenteuer_action"
              element={<AbenteuerAction />}
            />
            <Route
              path="/sms_textbild/abenteuer_action/:displayId"
              element={<AbenteuerAction />}
            />
            <Route path="/sms_textbild/erotik_sex" element={<ErotikSex />} />
            <Route
              path="/sms_textbild/erotik_sex/:displayId"
              element={<ErotikSex />}
            />

            {/* textbild2 */}
            <Route path="/textbild2" element={<Textbild2 />} />
            <Route path="/textbild2/neu2" element={<Neu2 />} />
            <Route
              path="/textbild2/liebe_freundschaft2"
              element={<LiebeFreundschaft2 />}
            />
            <Route
              path="/textbild2/liebe_freundschaft2/:displayId"
              element={<LiebeFreundschaft2 />}
            />
            <Route
              path="/textbild2/festtage_party2"
              element={<FesttageParty2 />}
            />
            <Route
              path="/textbild2/festtage_party2/:displayId"
              element={<FesttageParty2 />}
            />
            <Route
              path="/textbild2/freizeit_arbeit2"
              element={<FreizeitArbeit2 />}
            />
            <Route
              path="/textbild2/freizeit_arbeit2/:displayId"
              element={<FreizeitArbeit2 />}
            />
            <Route path="/textbild2/sport_hobby2" element={<SportHobby2 />} />
            <Route
              path="/textbild2/sport_hobby2/:displayId"
              element={<SportHobby2 />}
            />
            <Route
              path="/textbild2/abenteuer_action2"
              element={<AbenteuerAction2 />}
            />
            <Route
              path="/textbild2/abenteuer_action2/:displayId"
              element={<AbenteuerAction2 />}
            />
            <Route path="/textbild2/erotik_sex2" element={<ErotikSex2 />} />
            <Route
              path="/textbild2/erotik_sex2/:displayId"
              element={<ErotikSex2 />}
            />

            {/* ascii_art_film */}
            <Route path="/ascii_art_film" element={<AsciiFilm />} />
            <Route path="/ascii_art_film/matrix" element={<Matrix />} />
          </Routes>
        </main>
      </div>

      {/* Schatten */}
      <div className="schatten">
        {/* Social Media */}
        <div className="wrapper wrapper_social_media">
          <aside className="container container_social_media">
            <SocialMedia />
          </aside>
        </div>

        {/* Rechtliches */}
        <div className="wrapper wrapper_rechtliches">
          <aside className="container container_rechtliches">
            <Rechtliches />
          </aside>
        </div>
        
        {/* Footer */}
        <div className="wrapper wrapper_footer">
          <footer  className="container container_footer">
            <Footer />
          </footer >
        </div>
        
      </div>

      <Anker />
    </div>
  );
}

// ----------------------------------------------------
// 5. Haupt-Export
// ----------------------------------------------------
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
