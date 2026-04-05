import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { EMOJIS } from '../../lib/constants';

const POPUP_W = 180;

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let left = rect.left;
    const top = rect.bottom + 4;
    if (left + POPUP_W > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - POPUP_W - 8);
    }
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (popupRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', h);
    const repositionOrClose = () => setOpen(false);
    window.addEventListener('scroll', repositionOrClose, true);
    window.addEventListener('resize', repositionOrClose);
    return () => {
      document.removeEventListener('mousedown', h);
      window.removeEventListener('scroll', repositionOrClose, true);
      window.removeEventListener('resize', repositionOrClose);
    };
  }, [open]);

  const popup =
    open &&
    createPortal(
      <div
        ref={popupRef}
        className="fixed z-[200] bg-input-bg border border-border-dark rounded-lg p-1.5 grid grid-cols-6 gap-0.5 w-[180px] shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
        style={{ top: pos.top, left: pos.left }}
      >
        {EMOJIS.map((em) => (
          <button
            key={em}
            type="button"
            onClick={() => {
              onChange(em);
              setOpen(false);
            }}
            className={`${em === value ? 'bg-border' : 'bg-transparent'} border-none rounded text-base p-1 cursor-pointer leading-none`}
          >
            {em}
          </button>
        ))}
      </div>,
      document.body,
    );

  return (
    <span ref={triggerRef} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)} className="cursor-pointer text-base">
        {value}
      </span>
      {popup}
    </span>
  );
}
