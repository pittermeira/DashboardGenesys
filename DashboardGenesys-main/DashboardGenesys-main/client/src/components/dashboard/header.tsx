import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Download, Calendar, FileText, Search } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { format } from "date-fns";
import type { InteractionFilters } from "@/types/interaction";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface HeaderProps {
  filters: InteractionFilters;
  onFiltersChange: (filters: Partial<InteractionFilters>) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  queues: string[];
  agents: string[];
  mediaTypes: string[];
  wrapUps: string[];
  interactions: any[];
}

export function Header({ 
  filters, 
  onFiltersChange, 
  onExportCSV,
  onExportPDF,
  queues,
  agents,
  mediaTypes,
  wrapUps,
  interactions
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [agentSearch, setAgentSearch] = useState("");

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const date = value ? new Date(value) : null;
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      }
    });
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Live
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Global Filters */}
          <div className="flex items-center space-x-2">
            <Select 
              value={filters.queue} 
              onValueChange={(value) => onFiltersChange({ queue: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Queues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Queues</SelectItem>
                {queues.map((queue) => (
                  <SelectItem key={queue} value={queue}>
                    {queue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.mediaType} 
              onValueChange={(value) => onFiltersChange({ mediaType: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Media Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media Types</SelectItem>
                {mediaTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Select 
                value={filters.agent} 
                onValueChange={(value) => onFiltersChange({ agent: value })}
              >
                <SelectTrigger className="w-40 pr-8">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agents..."
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        className="pl-8 h-8"
                      />
                    </div>
                  </div>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents
                    .filter(agent => agent.toLowerCase().includes(agentSearch.toLowerCase()))
                    .map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <Button onClick={onExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
