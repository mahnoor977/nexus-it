import Sidebar from './Sidebar';
import Navbar from './Navbar';

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