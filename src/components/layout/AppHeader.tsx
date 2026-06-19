import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  GitBranch,
  MessageSquare,
  Cloud,
  TrendingUp,
} from 'lucide-react';
import { formatDateCN } from '@/utils/formatters';

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const navItems = [
    { path: '/', label: '风险总览', icon: LayoutDashboard },
    { path: '/scenario/evt-001', label: '情景推演', icon: GitBranch },
    { path: '/annotations', label: '批注意见', icon: MessageSquare },
  ];

  return (
    <header className="bg-navy-900 text-white">
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800">
        <div className="container px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30">
                  <Building2 className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-semibold tracking-wide text-white">
                    声誉风险晨会简报
                  </h1>
                  <p className="text-xs text-navy-300 tracking-wider">REPUTATION RISK BRIEFING</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Cloud className="w-4 h-4 text-navy-300" />
                <span className="text-sm text-navy-200">晴 26°C</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <TrendingUp className="w-4 h-4 text-risk-safe" />
                <span className="text-sm text-navy-200">上证指数 +0.85%</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-semibold text-white tracking-wider">
                  {formatTime(time)}
                </div>
                <div className="text-sm text-navy-300">{formatDateCN(time)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy-950/30 border-t border-white/5">
        <div className="container px-8">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'));
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                    isActive
                      ? 'text-brand-gold border-brand-gold bg-white/5'
                      : 'text-navy-300 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
