import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#F7F4EE] border-r border-[#E5E0D8] p-6 fixed left-0 top-0 z-30 flex flex-col justify-between text-[#1A1A1A]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#C5A059] flex items-center justify-center text-white font-bold">
            N
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-[#1A1A1A]">NEXUS-IT</h1>
            <p className="text-xs text-[#7A7A7A]">BUILD & SCALE</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <Link href="/projects" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A4A4A] hover:bg-[#EFEAE1] hover:text-[#1A1A1A] transition-colors">
            <svg className="w-5 h-5 text-[#7A7A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            <span>Projects</span>
          </Link>

          <Link href="/posts" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A4A4A] hover:bg-[#EFEAE1] hover:text-[#1A1A1A] transition-colors">
            <svg className="w-5 h-5 text-[#7A7A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            <span>Posts</span>
          </Link>

          <Link href="/messages" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A4A4A] hover:bg-[#EFEAE1] hover:text-[#1A1A1A] transition-colors">
            <svg className="w-5 h-5 text-[#7A7A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>Messages</span>
          </Link>

          <Link href="/forum" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A4A4A] hover:bg-[#EFEAE1] hover:text-[#1A1A1A] transition-colors">
            <svg className="w-5 h-5 text-[#7A7A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            <span>Forum</span>
          </Link>

          <Link href="/search" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A4A4A] hover:bg-[#EFEAE1] hover:text-[#1A1A1A] transition-colors">
            <svg className="w-5 h-5 text-[#7A7A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span>Search</span>
          </Link>
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-[#E5E0D8]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#EFEAE1] flex items-center justify-center font-bold text-sm text-[#1A1A1A] border border-[#D5CFC5]">
            MA
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">Mahnoor Ahsan</p>
            <p className="text-xs text-[#7A7A7A] truncate">Level 4 Architect</p>
          </div>
        </div>
      </div>
    </aside>
  );
}