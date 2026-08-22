import { useState, useEffect, useRef } from 'react';

export default function MobileMenu({ links }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mobile-menu-wrap" ref={wrapRef}>
      <button className="hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
        <span></span><span></span><span></span>
      </button>
      {open && (
        <div className="mobile-menu-panel">
          {links.map((link, i) => (
            <button
              key={i}
              className="mobile-menu-link"
              onClick={() => {
                setOpen(false);
                link.onClick();
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}