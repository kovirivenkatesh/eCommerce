import { useEffect, useRef, useState } from 'react';

function getInitials(user) {
  const label = user?.name || user?.email || 'User';
  return label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function ProfileAvatar({ user, large = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user?.avatarUrl || user?.image;

  return (
    <span className={`profile-avatar${large ? ' profile-avatar-large' : ''}`} aria-hidden="true">
      {imageUrl && !imageFailed ? (
        <img src={imageUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        getInitials(user)
      )}
    </span>
  );
}

export default function ProfileMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.name || user?.email || 'My account';

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
      >
        <ProfileAvatar user={user} />
        <span className="profile-trigger-name">{displayName}</span>
        <svg
          className={`profile-chevron${isOpen ? ' is-open' : ''}`}
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-summary">
            <ProfileAvatar user={user} large />
            <div className="profile-details">
              <strong>{displayName}</strong>
              {user?.email && <span>{user.email}</span>}
              <small>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</small>
            </div>
          </div>
          <button
            type="button"
            className="profile-logout"
            onClick={onLogout}
          >
            <span aria-hidden="true">↪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
