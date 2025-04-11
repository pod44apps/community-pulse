import Layout from "./Layout.jsx";

import Members from "./Members";

import Profile from "./Profile";

import Dashboard from "./Dashboard";

import Ventures from "./Ventures";

import ActionCards from "./ActionCards";

import AppStore from "./AppStore";

import Settings from "./Settings";

import VentureDetail from "./VentureDetail";

import ActionCardDetail from "./ActionCardDetail";

import AppDetail from "./AppDetail";

import MemberProfile from "./MemberProfile";

import VentureEditor from "./VentureEditor";

import ActionCardEditor from "./ActionCardEditor";

import AppEditor from "./AppEditor";

import Messages from "./Messages";

import ExportDatabase from "./ExportDatabase";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Members: Members,
    
    Profile: Profile,
    
    Dashboard: Dashboard,
    
    Ventures: Ventures,
    
    ActionCards: ActionCards,
    
    AppStore: AppStore,
    
    Settings: Settings,
    
    VentureDetail: VentureDetail,
    
    ActionCardDetail: ActionCardDetail,
    
    AppDetail: AppDetail,
    
    MemberProfile: MemberProfile,
    
    VentureEditor: VentureEditor,
    
    ActionCardEditor: ActionCardEditor,
    
    AppEditor: AppEditor,
    
    Messages: Messages,
    
    ExportDatabase: ExportDatabase,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Members />} />
                
                
                <Route path="/Members" element={<Members />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Ventures" element={<Ventures />} />
                
                <Route path="/ActionCards" element={<ActionCards />} />
                
                <Route path="/AppStore" element={<AppStore />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/VentureDetail" element={<VentureDetail />} />
                
                <Route path="/ActionCardDetail" element={<ActionCardDetail />} />
                
                <Route path="/AppDetail" element={<AppDetail />} />
                
                <Route path="/MemberProfile" element={<MemberProfile />} />
                
                <Route path="/VentureEditor" element={<VentureEditor />} />
                
                <Route path="/ActionCardEditor" element={<ActionCardEditor />} />
                
                <Route path="/AppEditor" element={<AppEditor />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/ExportDatabase" element={<ExportDatabase />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}