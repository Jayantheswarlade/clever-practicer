import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Calculator, 
  Eye, 
  PenTool, 
  GraduationCap,
  History,
  User,
  FileText
} from "lucide-react";

const navItems = [
  { title: "About", path: "/about", icon: FileText },
  { title: "AI Solver", path: "/solver", icon: Calculator },
  { title: "AI STEM Visualizer", path: "/visualizer", icon: Eye },
  { title: "AI Notetaker", path: "/notetaker", icon: PenTool },
  { title: "AI Mastery Drill", path: "/", icon: GraduationCap },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/GPAI.ico" className="w-35 h-7 text-white "/>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-smooth ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/history"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-smooth"
        >
          <History className="w-5 h-5" />
          <span className="text-sm">History</span>
        </Link>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-sidebar-foreground">User</span>
        </div>
      </div>
    </aside>
  );
}
