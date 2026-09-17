import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Shared shell for all authenticated pages: sidebar + navbar + uniformly
// padded content area (.page-content controls heading spacing everywhere).
export default function AppLayout({ nickname, children }) {
  return (
    <>
      <Sidebar nickname={nickname} />
      <div className="app-main">
        <Navbar nickname={nickname} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
