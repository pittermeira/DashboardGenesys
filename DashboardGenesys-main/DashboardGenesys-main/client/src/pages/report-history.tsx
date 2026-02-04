import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Download, Trash2, Search, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  name: string;
  type: "csv" | "pdf";
  createdAt: Date;
  recordCount: number;
  filters: string;
  size: string;
}

export function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "Weekly Interactions Report",
      type: "pdf",
      createdAt: new Date(2025, 5, 20),
      recordCount: 1250,
      filters: "Queue: All, Date: 06/14-06/20",
      size: "2.4 MB"
    },
    {
      id: "2", 
      name: "Agent Performance Export",
      type: "csv",
      createdAt: new Date(2025, 5, 19),
      recordCount: 890,
      filters: "Agent: All, Media: WhatsApp",
      size: "156 KB"
    },
    {
      id: "3",
      name: "Queue Analysis Report",
      type: "pdf", 
      createdAt: new Date(2025, 5, 18),
      recordCount: 2100,
      filters: "Queue: C_EPS4_WHATSAPP, All dates",
      size: "3.1 MB"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.filters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectReport = (reportId: string, selected: boolean) => {
    if (selected) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    }
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  const handleDownload = (report: Report) => {
    // Create a simulated file download
    const content = report.type === "pdf" ? "PDF content here..." : "CSV content here...";
    const blob = new Blob([content], { 
      type: report.type === "pdf" ? "application/pdf" : "text/csv" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.name}.${report.type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    setSelectedReports(selectedReports.filter(id => id !== reportId));
  };

  const handleBulkDelete = () => {
    setReports(reports.filter(r => !selectedReports.includes(r.id)));
    setSelectedReports([]);
  };

  const getReportIcon = (type: "csv" | "pdf") => {
    return <FileText className={`w-5 h-5 ${type === "pdf" ? "text-red-500" : "text-green-500"}`} />;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your exported reports and analysis files
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generated Reports</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {selectedReports.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedReports.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reports</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedReports.length} selected reports? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete Reports
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No reports match your search." : "Export your first report to see it here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  {selectedReports.length === filteredReports.length ? "Deselect All" : "Select All"}
                </span>
              </div>

              {/* Reports List */}
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={(e) => handleSelectReport(report.id, e.target.checked)}
                      className="rounded"
                    />
                    {getReportIcon(report.type)}
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.recordCount} records • {report.size} • {format(report.createdAt, "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Filter className="w-3 h-3 inline mr-1" />
                        {report.filters}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.type === "pdf" ? "default" : "secondary"}>
                      {report.type.toUpperCase()}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{report.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(report.id)} 
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Report
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}