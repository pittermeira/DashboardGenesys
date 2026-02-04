import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { Charts } from "@/components/dashboard/charts";
import { InteractionsTable } from "@/components/dashboard/interactions-table";
import { CSVUpload } from "@/components/csv-upload";
import { FileManager } from "@/components/dashboard/file-manager";
import { AnalysisPage } from "@/pages/analysis";
import { AdvancedFiltersPage } from "@/pages/advanced-filters";
import { ReportHistoryPage } from "@/pages/report-history";
import { useInteractions, useClearInteractions } from "@/hooks/use-interactions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { 
  calculateMetrics, 
  getTopAgents, 
  getQueueDistribution, 
  getUniqueValues 
} from "@/lib/data-utils";
import type { InteractionFilters } from "@/types/interaction";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [filters, setFilters] = useState<InteractionFilters>({
    dateRange: { from: null, to: null },
    queue: "all",
    agent: "all",
    mediaType: "all",
    wrapUp: "all",
    flow: "all",
  });

  // Real uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    uploadDate: Date;
    recordCount: number;
    isActive: boolean;
    size: string;
  }>>([]);

  const { data: interactions = [], isLoading, error } = useInteractions();
  const clearMutation = useClearInteractions();
  const { toast } = useToast();

  // Filter interactions based on current filters
  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      // Date range filter
      if (filters.dateRange.from && new Date(interaction.startTime) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && new Date(interaction.startTime) > filters.dateRange.to) {
        return false;
      }
      
      // Other filters
      if (filters.queue && filters.queue !== "all" && !interaction.queue.includes(filters.queue)) return false;
      if (filters.agent && filters.agent !== "all" && !interaction.agent.includes(filters.agent)) return false;
      if (filters.mediaType && filters.mediaType !== "all" && interaction.mediaType !== filters.mediaType) return false;
      if (filters.wrapUp && filters.wrapUp !== "all" && (!interaction.wrapUp || !interaction.wrapUp.includes(filters.wrapUp))) return false;
      if (filters.flow && filters.flow !== "all" && (!interaction.flow || !interaction.flow.includes(filters.flow))) return false;
      
      return true;
    });
  }, [interactions, filters]);

  // Calculate metrics and analysis data
  const metrics = useMemo(() => calculateMetrics(filteredInteractions), [filteredInteractions]);
  const topAgents = useMemo(() => getTopAgents(filteredInteractions), [filteredInteractions]);
  const queueDistribution = useMemo(() => getQueueDistribution(filteredInteractions), [filteredInteractions]);

  // Get unique values for filter dropdowns
  const queues = useMemo(() => getUniqueValues(interactions, 'queue'), [interactions]);
  const agents = useMemo(() => getUniqueValues(interactions, 'agent'), [interactions]);
  const mediaTypes = useMemo(() => getUniqueValues(interactions, 'mediaType'), [interactions]);
  const wrapUps = useMemo(() => 
    interactions
      .map(i => i.wrapUp)
      .filter((wrapUp): wrapUp is string => Boolean(wrapUp))
      .reduce((acc: string[], wrapUp) => {
        const uniqueWrapUps = wrapUp.split(';').map(w => w.trim()).filter(Boolean);
        uniqueWrapUps.forEach(w => {
          if (!acc.includes(w)) acc.push(w);
        });
        return acc;
      }, [])
      .sort()
  , [interactions]);

  const handleFiltersChange = (newFilters: Partial<InteractionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Agent", "Customer", "Queue", "Media Type", "Duration", 
      "Wrap-up", "Start Time", "End Time", "Conversation ID"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredInteractions.map(interaction => [
        `"${interaction.agent}"`,
        `"${interaction.customer}"`,
        `"${interaction.queue}"`,
        `"${interaction.mediaType}"`,
        interaction.duration,
        `"${interaction.wrapUp || ""}"`,
        `"${new Date(interaction.startTime).toISOString()}"`,
        `"${new Date(interaction.endTime).toISOString()}"`,
        `"${interaction.conversationId}"`
      ].join(","))
    ].join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interactions-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Exported ${filteredInteractions.length} interactions to CSV`,
    });
  };

  const handleExportPDF = async () => {
    try {
      // Dynamic import jsPDF
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      // Import autoTable plugin
      await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Genesys Cloud Interactions Report', 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Interactions: ${filteredInteractions.length}`, 20, 40);
      
      // Prepare data for table
      const tableData = filteredInteractions.slice(0, 50).map(interaction => [
        interaction.agent,
        interaction.customer,
        interaction.queue,
        interaction.mediaType,
        `${Math.round(interaction.duration / 1000 / 60)}:${String(Math.round((interaction.duration / 1000) % 60)).padStart(2, '0')}`,
        interaction.wrapUp || '-',
        new Date(interaction.startTime).toLocaleDateString(),
        new Date(interaction.endTime).toLocaleDateString(),
        interaction.conversationId.substring(0, 8) + '...'
      ]);

      // Add table using autoTable
      (doc as any).autoTable({
        head: [['Agent', 'Customer', 'Queue', 'Media Type', 'Duration', 'Wrap-up', 'Start Date', 'End Date', 'Conv ID']],
        body: tableData,
        startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        theme: 'striped'
      });

      // Save PDF
      doc.save(`interactions-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Export Successful",
        description: `Exported ${Math.min(filteredInteractions.length, 50)} interactions to PDF`,
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = async () => {
    try {
      await clearMutation.mutateAsync();
      toast({
        title: "Data Cleared",
        description: "All interactions have been removed from the system",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = (fileName: string, recordCount: number) => {
    // Add the uploaded file to the list
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      uploadDate: new Date(),
      recordCount: recordCount,
      isActive: true,
      size: "Unknown" // Could be calculated if needed
    };
    setUploadedFiles(prev => [...prev, newFile]);
    
    setActiveSection("dashboard");
    toast({
      title: "Upload Complete",
      description: "CSV data has been successfully imported",
    });
  };

  const handleToggleFile = (fileId: string) => {
    setUploadedFiles(files => 
      files.map(file => 
        file.id === fileId ? { ...file, isActive: !file.isActive } : file
      )
    );
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(files => files.filter(file => file.id !== fileId));
    // Also clear the interactions data if this was the active file
    clearMutation.mutate();
    toast({
      title: "File Deleted",
      description: "The file and its data have been removed from the system",
    });
  };

  const handleDeleteMultiple = (fileIds: string[]) => {
    setUploadedFiles(files => files.filter(file => !fileIds.includes(file.id)));
    // Clear all interactions data when multiple files are deleted
    clearMutation.mutate();
    toast({
      title: "Files Deleted",
      description: `${fileIds.length} files and their data have been removed from the system`,
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load interactions data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={setActiveSection}
        uploadedFiles={uploadedFiles}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          queues={queues}
          agents={agents}
          mediaTypes={mediaTypes}
          wrapUps={wrapUps}
          interactions={filteredInteractions}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {activeSection === "upload" ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">CSV Upload</h1>
                  <p className="text-muted-foreground mt-2">
                    Import Genesys Cloud interaction data from CSV files
                  </p>
                </div>
                {interactions.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearData}
                    disabled={clearMutation.isPending}
                  >
                    {clearMutation.isPending ? "Clearing..." : "Clear Data"}
                  </Button>
                )}
              </div>
              
              <CSVUpload onUploadComplete={handleUploadComplete} />
              
              <FileManager 
                files={uploadedFiles}
                onToggleFile={handleToggleFile}
                onDeleteFile={handleDeleteFile}
                onDeleteMultiple={handleDeleteMultiple}
              />
              
              {interactions.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Currently displaying {interactions.length} interactions. 
                    Upload a new CSV to replace existing data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : activeSection === "queue" ? (
            <AnalysisPage interactions={filteredInteractions} analysisType="queue" />
          ) : activeSection === "agent" ? (
            <AnalysisPage interactions={filteredInteractions} analysisType="agent" />
          ) : activeSection === "time" ? (
            <AnalysisPage interactions={filteredInteractions} analysisType="time" />
          ) : activeSection === "wrapup" ? (
            <AnalysisPage interactions={filteredInteractions} analysisType="wrapup" />
          ) : activeSection === "reports" ? (
            <ReportHistoryPage />
          ) : interactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Upload className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                <p className="text-muted-foreground mb-4">
                  Upload a CSV file to start analyzing your interaction data
                </p>
                <Button onClick={() => setActiveSection("upload")}>
                  Upload CSV File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <MetricsCards metrics={metrics} />
              
              {/* Charts */}
              <Charts 
                interactions={filteredInteractions}
                topAgents={topAgents}
                queueDistribution={queueDistribution}
              />
              
              {/* Recent Interactions Table */}
              <InteractionsTable interactions={filteredInteractions} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
