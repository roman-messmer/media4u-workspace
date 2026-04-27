// src/components/nav/Nav.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import '../nav/Nav.css'

export default function Nav() {
  const navRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const EPS = 1 // kleine Toleranz für iOS Rundungsfehler
  const SCROLL_STEP = 240

  const getMaxLeft = (el) => Math.max(0, el.scrollWidth - el.clientWidth)
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  const updateButtons = useCallback(() => {
    const el = navRef.current
    if (!el) return
    const maxLeft = getMaxLeft(el)
    const x = el.scrollLeft
    setCanLeft(x > EPS)
    setCanRight(x < maxLeft - EPS)
  }, [])

  useEffect(() => {
    updateButtons()
    const el = navRef.current
    if (!el) return
    const onScroll = () => updateButtons()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateButtons])

  const scrollByClamped = (dir /* -1 links, +1 rechts */) => {
    const el = navRef.current
    if (!el) return
    const maxLeft = getMaxLeft(el)
    const current = el.scrollLeft
    const delta = dir < 0
      ? -Math.min(SCROLL_STEP, current)
      :  Math.min(SCROLL_STEP, maxLeft - current)
    const target = clamp(current + delta, 0, maxLeft)
    const dist = Math.abs(target - current)

    el.scrollTo({ left: target, behavior: dist > 4 ? 'smooth' : 'auto' })
    requestAnimationFrame(updateButtons)
  }

  const scrollLeftFn  = () => scrollByClamped(-1)
  const scrollRightFn = () => scrollByClamped(+1)

  return (
    <div className="nav_bar">
      <button
        type="button"
        className="nav_scroll_btn"
        aria-label="Nach links scrollen"
        title="Nach links scrollen"
        onClick={scrollLeftFn}
        disabled={!canLeft}
        aria-controls="topnav"
      >
        <img
          className="nav_scroll_icon"
          alt=""
          aria-hidden="true"
          src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3e%3cpath%20d='M169.4%20297.4C156.9%20309.9%20156.9%20330.2%20169.4%20342.7L361.4%20534.7C373.9%20547.2%20394.2%20547.2%20406.7%20534.7C419.2%20522.2%20419.2%20501.9%20406.7%20489.4L237.3%20320L406.6%20150.6C419.1%20138.1%20419.1%20117.8%20406.6%20105.3C394.1%2092.8%20373.8%2092.8%20361.3%20105.3L169.3%20297.3z'/%3e%3c/svg%3e"
        />
      </button>

      <nav id="topnav" ref={navRef} className="nav" aria-label="Navigation">
        <NavLink to="/sms_textbild" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          SMS Textbild
        </NavLink>
        <NavLink to="/textbild2" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Textbild 2.0
        </NavLink>
        <NavLink to="/vorlagen" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Vorlagen
        </NavLink>
      </nav>

      <button
        type="button"
        className="nav_scroll_btn"
        aria-label="Nach rechts scrollen"
        title="Nach rechts scrollen"
        onClick={scrollRightFn}
        disabled={!canRight}
        aria-controls="topnav"
      >
        <img
          className="nav_scroll_icon"
          alt=""
          aria-hidden="true"
          src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3e%3cpath%20d='M471.1%20297.4C483.6%20309.9%20483.6%20330.2%20471.1%20342.7L279.1%20534.7C266.6%20547.2%20246.3%20547.2%20233.8%20534.7C221.3%20522.2%20221.3%20501.9%20233.8%20489.4L403.2%20320L233.9%20150.6C221.4%20138.1%20221.4%20117.8%20233.9%20105.3C246.4%2092.8%20266.7%2092.8%20279.2%20105.3L471.2%20297.3z'/%3e%3c/svg%3e"
        />
      </button>
    </div>
  )
}
