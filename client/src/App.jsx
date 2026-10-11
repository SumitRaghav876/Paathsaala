import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from './api.js';
import { BookmarksProvider } from './bookmarks.jsx';
import { SITE } from './site.js';
import Icon from './icons.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Browse from './pages/Browse.jsx';
import Resource from './pages/Resource.jsx';
import MyLibrary from './pages/MyLibrary.jsx';
import Quiz from './pages/Quiz.jsx';
import Papers from './pages/Papers.jsx';
import Teacher from './pages/Teacher.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import Legal from './pages/Legal.jsx';

function Logo() {
  return <span className="logo"><Icon name="book" size={20} /></span>;
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = useNavigate();
  const logout = () => { clearSession(); setUser(null); nav('/'); };

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <BookmarksProvider user={user}>
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <div className="topin">
          <NavLink to="/" className="brand"><Logo />{SITE.name}</NavLink>
          <nav className={'nav' + (open ? ' open' : '')} id="main-nav" aria-label="Main">
            <NavLink to="/search">Library</NavLink>
            <NavLink to="/browse/subjectName">Browse</NavLink>
            <NavLink to="/quiz">Quizzes</NavLink>
            <NavLink to="/papers">Paper maker</NavLink>
            <NavLink to="/teacher">AI teacher</NavLink>
            <NavLink to="/my-library">My library</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <div className="who">
            {user ? (<><span className="name">{user.name || user.email}</span><button className="link" onClick={logout}>Log out</button></>)
              : <Link className="btn small" to="/login">Log in</Link>}
          </div>
          <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      <main id="main">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse/:facet" element={<Browse />} />
          <Route path="/resource/:id" element={<Resource />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/login" element={<Login onAuth={setUser} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="/disclaimer" element={<Legal doc="disclaimer" />} />
          <Route path="*" element={<div className="sheet narrow"><h1>Page not found</h1><p>The page you are looking for does not exist or has moved.</p><Link className="btn" to="/">Go to the home page</Link></div>} />
        </Routes>
      </main>

      <footer className="foot">
        <div className="footgrid">
          <div>
            <span className="brand"><Logo />{SITE.name}</span>
            <p>{SITE.tagline}</p>
          </div>
          <div><h4>Learn</h4><Link to="/search">Library</Link><Link to="/browse/subjectName">Browse by subject</Link><Link to="/my-library">My library</Link></div>
          <div><h4>Practise</h4><Link to="/quiz">Chapter quizzes</Link><Link to="/papers">Paper maker</Link><Link to="/teacher">AI teacher</Link></div>
          <div><h4>Legal and help</h4><Link to="/terms">Terms and Conditions</Link><Link to="/privacy">Privacy Policy</Link><Link to="/disclaimer">Disclaimer</Link><a href={'mailto:' + SITE.email}>Contact us</a></div>
        </div>
        <p className="copy">&copy; {new Date().getFullYear()} {SITE.company}. Resources are linked from their original publishers, who are responsible for their content. {SITE.name} is not affiliated with NCERT, CBSE, NTA, UPSC or NIOS.</p>
      </footer>
    </BookmarksProvider>
  );
}
