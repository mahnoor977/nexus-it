import Avatar from './Avatar';

export default function Topbar({ nickname, avatarUrl }) {
  return (
    <div className="topbar">
      <div className="topbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/logo.png" alt="NEXUS-IT" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        <span>NEXUS-IT</span>
      </div>
      <div className="topbar-user">
        <Avatar url={avatarUrl} nickname={nickname} size={32} />
        <span className="topbar-name">{nickname}</span>
      </div>
    </div>
  );
}