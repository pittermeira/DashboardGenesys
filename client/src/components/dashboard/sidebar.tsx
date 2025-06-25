import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  LayoutDashboard, 
  Upload, 
  Users, 
  Clock, 
  Tag, 
  Filter,
  FileText,
  Activity
} from "lucide-react";

interface SidebarProps {
  onNavigate?: (section: string) => void;
  activeSection?: string;
  uploadedFiles?: Array<{
    id: string;
    name: string;
    recordCount: number;
    isActive: boolean;
  }>;
}

export function Sidebar({ onNavigate, activeSection = "dashboard", uploadedFiles = [] }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    {
      section: "main",
      title: "MAIN",
      items: [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
        { key: "upload", label: "CSV File Upload", icon: Upload, href: "/upload" },
      ]
    },
    {
      section: "analysis",
      title: "ANALYSIS", 
      items: [
        { key: "queue", label: "Analysis by Queue", icon: Activity, href: "/analysis/queue" },
        { key: "agent", label: "Analysis by Agent", icon: Users, href: "/analysis/agent" },
        { key: "time", label: "Time Series Analysis", icon: Clock, href: "/analysis/time" },
        { key: "wrapup", label: "Analysis by Wrap-up", icon: Tag, href: "/analysis/wrapup" },
      ]
    },
    {
      section: "tools",
      title: "TOOLS",
      items: [

        { key: "reports", label: "Report History", icon: FileText, href: "/tools/reports" },
      ]
    }
  ];

  const handleItemClick = (key: string) => {
    onNavigate?.(key);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">DataVision</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigationItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`
                      w-full justify-start sidebar-item
                      ${isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-sidebar-foreground"}
                    `}
                    onClick={() => handleItemClick(item.key)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Uploaded Files Section */}
      {uploadedFiles.length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Active Files
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadedFiles
              .filter(file => file.isActive)
              .slice(0, 3)
              .map((file) => (
                <div key={file.id} className="flex items-center space-x-2 p-2 rounded-md bg-sidebar-accent/50">
                  <FileText className="w-3 h-3 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{file.recordCount} records</div>
                  </div>
                </div>
              ))}
            {uploadedFiles.filter(file => file.isActive).length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{uploadedFiles.filter(file => file.isActive).length - 3} more files
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
