import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Key, CreditCard, Users, Activity,
  FileText, History, ChevronDown, ChevronRight,
  Monitor, Globe, BookOpen, PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react';

// ─── Shared nav link builder ──────────────────────────────────────────────────

const NavItem = ({ to, icon: Icon, label, collapsed, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors group relative ${
        isActive
          ? 'bg-primary-50 text-primary-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      } ${collapsed ? 'justify-center' : ''}`
    }
  >
    <Icon size={20} className="flex-shrink-0" />
    {!collapsed && <span className="text-sm truncate">{label}</span>}
  </NavLink>
);

// ─── Collapsible section ──────────────────────────────────────────────────────

const NavSection = ({ icon: Icon, label, collapsed, expanded, onToggle, children }) => (
  <div className="mb-1">
    <button
      onClick={onToggle}
      title={collapsed ? label : undefined}
      className={`flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
        collapsed ? 'justify-center' : 'justify-between'
      }`}
    >
      <div className={`flex items-center gap-3 ${collapsed ? '' : ''}`}>
        <Icon size={20} className="flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && (expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}
    </button>

    {expanded && !collapsed && (
      <div className="ml-3 mt-0.5 border-l border-gray-100 pl-3">
        {children}
      </div>
    )}
    {expanded && collapsed && (
      <div className="mt-0.5">
        {children}
      </div>
    )}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ product, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [webAppExpanded,  setWebAppExpanded]  = useState(true);

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  // nav items shared between CT and X-ray common parts
  const commonLinks = (onItemClick, isCollapsed = collapsed) => (
    <>
      <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={isCollapsed} end onClick={onItemClick} />
      <div className="border-t border-gray-100 my-2" />
    </>
  );

  const logo = (
    <div className={`flex items-center justify-between px-3 py-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
      {!collapsed && (
        <div>
          <h1 className="text-xl font-bold text-primary-600 leading-tight">DecXpert</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      )}
      {collapsed && (
        <span className="text-xl font-bold text-primary-600">D</span>
      )}
      {/* Desktop collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
  );

  const ctNav = (onItemClick, isCollapsed = collapsed) => (
    <nav className="px-2 py-3 flex-1 overflow-y-auto">
      {commonLinks(onItemClick, isCollapsed)}

      <NavSection
        icon={Monitor} label="Desktop EXE"
        collapsed={isCollapsed}
        expanded={desktopExpanded}
        onToggle={() => setDesktopExpanded(v => !v)}
      >
        <NavItem to="/licenses" icon={Key} label="Licenses" collapsed={isCollapsed} onClick={onItemClick} />
      </NavSection>

      <div className="border-t border-gray-100 my-2" />
      <NavItem to="/plans"   icon={BookOpen}  label="Plans"      collapsed={isCollapsed} onClick={onItemClick} />
      <NavItem to="/reports" icon={FileText}   label="Reports"    collapsed={isCollapsed} onClick={onItemClick} />
      <NavItem to="/audit"   icon={History}    label="Audit Logs" collapsed={isCollapsed} onClick={onItemClick} />
    </nav>
  );

  const xrayNav = (onItemClick, isCollapsed = collapsed) => (
    <nav className="px-2 py-3 flex-1 overflow-y-auto">
      {commonLinks(onItemClick, isCollapsed)}

      <NavSection
        icon={Monitor} label="Desktop EXE"
        collapsed={isCollapsed}
        expanded={desktopExpanded}
        onToggle={() => setDesktopExpanded(v => !v)}
      >
        <NavItem to="/licenses" icon={Key} label="Licenses" collapsed={isCollapsed} onClick={onItemClick} />
      </NavSection>

      <NavSection
        icon={Globe} label="Web App"
        collapsed={isCollapsed}
        expanded={webAppExpanded}
        onToggle={() => setWebAppExpanded(v => !v)}
      >
        <NavItem to="/subscriptions/plans"    icon={CreditCard} label="Subscription Plans"  collapsed={isCollapsed} onClick={onItemClick} />
        <NavItem to="/subscriptions/users"    icon={Users}      label="User Subscriptions"  collapsed={isCollapsed} onClick={onItemClick} />
        <NavItem to="/subscriptions/activity" icon={Activity}   label="Subscription Activity" collapsed={isCollapsed} onClick={onItemClick} />
      </NavSection>

      <div className="border-t border-gray-100 my-2" />
      <NavItem to="/plans"   icon={BookOpen} label="Plans"      collapsed={isCollapsed} onClick={onItemClick} />
      <NavItem to="/reports" icon={FileText}  label="Reports"    collapsed={isCollapsed} onClick={onItemClick} />
      <NavItem to="/audit"   icon={History}   label="Audit Logs" collapsed={isCollapsed} onClick={onItemClick} />
    </nav>
  );

  const navContent = product === 'ct' ? ctNav : xrayNav;

  // ── Desktop sidebar ──────────────────────────────────────────────────────────
  const desktopSidebar = (
    <div
      className={`hidden md:flex flex-col bg-white border-r min-h-screen flex-shrink-0 transition-all duration-200 ${sidebarWidth}`}
    >
      {logo}
      {navContent(null)}
    </div>
  );

  // ── Mobile sidebar (overlay) ─────────────────────────────────────────────────
  const mobileSidebar = (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-30 flex flex-col transform transition-transform duration-200 md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-primary-600">DecXpert</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      {/* Mobile nav — always expanded, closes on link click */}
      {product === 'ct' ? ctNav(onCloseMobile, false) : xrayNav(onCloseMobile, false)}
    </div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
};

export default Sidebar;
