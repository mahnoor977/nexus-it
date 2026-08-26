export default function Avatar({ url, nickname, size = 40 }) {
  const initials = (nickname || '?').slice(0, 2).toUpperCase();

  return (
    <div
      className="avatar-circle"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {url ? <img src={url} alt={nickname} /> : initials}
    </div>
  );
}