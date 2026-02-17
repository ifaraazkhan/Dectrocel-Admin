import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Key,
  CreditCard,
  Users,
  Activity,
  FileText,
  History,
  ChevronDown,
  ChevronRight,
  Monitor,
  Globe
} from 'lucide-react';

const Sidebar = ({ product }) => {
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [webAppExpanded, setWebAppExpanded] = useState(true);

  // X-ray navigation structure
  const xrayNav = {
    dashboard: { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    desktop: {
      label: 'Desktop EXE',
      icon: Monitor,
      items: [
        { path: '/licenses', icon: Key, label: 'Licenses' }
      ]
    },
    webapp: {
      label: 'Web App',
      icon: Globe,
      items: [
        { path: '/subscriptions/plans', icon: CreditCard, label: 'Subscription Plans' },
        { path: '/subscriptions/users', icon: Users, label: 'User Subscriptions' },
        { path: '/subscriptions/activity', icon: Activity, label: 'Subscription Activity' }
      ]
    },
    reports: { path: '/reports', icon: FileText, label: 'Reports' },
    audit: { path: '/audit', icon: History, label: 'Audit Logs' }
  };

  // CT navigation items (empty for now)
  const ctNavItems = [];

  if (product === 'ct') {
    return (
      <div className="w-64 bg-white border-r min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">DecXpert</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <div className="text-center text-gray-400 py-8 px-3">
          <p className="text-sm">Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">DecXpert</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      <nav className="px-3 pb-6">
        {/* Dashboard */}
        <NavLink
          to={xrayNav.dashboard.path}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <xrayNav.dashboard.icon size={20} />
          <span>{xrayNav.dashboard.label}</span>
        </NavLink>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Desktop EXE Section */}
        <div className="mb-2">
          <button
            onClick={() => setDesktopExpanded(!desktopExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <xrayNav.desktop.icon size={18} />
              <span>{xrayNav.desktop.label}</span>
            </div>
            {desktopExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {desktopExpanded && (
            <div className="ml-4 mt-1">
              {xrayNav.desktop.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Web App Section */}
        <div className="mb-2">
          <button
            onClick={() => setWebAppExpanded(!webAppExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <xrayNav.webapp.icon size={18} />
              <span>{xrayNav.webapp.label}</span>
            </div>
            {webAppExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {webAppExpanded && (
            <div className="ml-4 mt-1">
              {xrayNav.webapp.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Reports */}
        <NavLink
          to={xrayNav.reports.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <xrayNav.reports.icon size={20} />
          <span>{xrayNav.reports.label}</span>
        </NavLink>

        {/* Audit Logs */}
        <NavLink
          to={xrayNav.audit.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <xrayNav.audit.icon size={20} />
          <span>{xrayNav.audit.label}</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
