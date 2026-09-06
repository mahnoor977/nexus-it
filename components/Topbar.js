import Avatar from './Avatar';

export default function Topbar({ nickname, avatarUrl }) {
  return (
    <div className="topbar">
      <div className="topbar-brand">NEXUS-IT</div>
      <div className="topbar-user">
        <Avatar url={avatarUrl} nickname={nickname} size={32} />
        <span className="topbar-name">{nickname}</span>
      </div>
    </div>
  );
}