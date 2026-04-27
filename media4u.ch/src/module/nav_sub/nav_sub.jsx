import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import ActiveNavLink from '../ActiveNavLink';
import AngleLeft from '../../icons/angle-left-solid-full.svg';
import AngleRight from '../../icons/angle-right-solid-full.svg';
import './nav_sub.css';

const NavSub = () => {
  const navRef = useRef(null);
  const { t } = useTranslation();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!navRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navRef.current;

    setCanScrollLeft(Math.ceil(scrollLeft) > 1);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
  }, []);

  const scrollNav = (direction) => {
    if (!navRef.current) return;

    const scrollAmount = navRef.current.clientWidth * 0.6;
    const newScroll = direction === 'left'
      ? navRef.current.scrollLeft - scrollAmount
      : navRef.current.scrollLeft + scrollAmount;

    navRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      nav.scrollBy({ left: e.deltaY });
    };

    checkScrollPosition();

    const resizeObserver = new ResizeObserver(() => checkScrollPosition());
    resizeObserver.observe(nav);

    const mutationObserver = new MutationObserver(() => checkScrollPosition());
    mutationObserver.observe(nav, { childList: true, subtree: true, characterData: true });

    nav.addEventListener('scroll', checkScrollPosition, { passive: true });
    nav.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      nav.removeEventListener('scroll', checkScrollPosition);
      nav.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [checkScrollPosition]);

  return (
    <div className="nav-sub-wrapper">
      <button
        className="nav-sub-wrapper__arrow nav-sub-wrapper__arrow--left"
        onClick={() => scrollNav('left')}
        disabled={!canScrollLeft}
        aria-label={t('nav_sub.scroll_left', 'Nach links scrollen')}
        tabIndex="-1" 
      >
        <img src={AngleLeft} alt="" aria-hidden="true" className="nav-sub-wrapper__icon" />
      </button>

      <nav
        className="nav-sub-wrapper__track"
        ref={navRef}
        role="navigation"
        aria-label="Subnavigation"
        onTouchStart={() => {}}
      >
        <ActiveNavLink />
      </nav>

      <button
        className="nav-sub-wrapper__arrow nav-sub-wrapper__arrow--right"
        onClick={() => scrollNav('right')}
        disabled={!canScrollRight}
        aria-label={t('nav_sub.scroll_right', 'Nach rechts scrollen')}
        tabIndex="-1"
      >
        <img src={AngleRight} alt="" aria-hidden="true" className="nav-sub-wrapper__icon" />
      </button>
    </div>
  );
};

export default NavSub;