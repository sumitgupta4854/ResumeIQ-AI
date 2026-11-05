import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="container section"><Outlet /></main>
    </div>
  );
}
