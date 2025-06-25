import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { uploadCSVFile } from "@/lib/csv-parser";
import { useUploadInteractions } from "@/hooks/use-interactions";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface CSVUploadProps {
  onUploadComplete?: (fileName: string, recordCount: number) => void;
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadMutation = useUploadInteractions();
  const { toast } = useToast();
  
  // Query para buscar dados das interações para export
  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions'],
    queryFn: async () => {
      const response = await fetch('/api/interactions');
      if (!response.ok) throw new Error('Failed to fetch interactions');
      return response.json();
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      setProgress(20);
      const interactions = await uploadCSVFile(file);
      
      setProgress(60);
      await uploadMutation.mutateAsync(interactions);
      
      setProgress(100);
      setSuccess(`Successfully imported ${interactions.length} interactions`);
      
      if (onUploadComplete) {
        onUploadComplete(file.name, interactions.length);
      }
      
      toast({
        title: "Upload Successful",
        description: `Imported ${interactions.length} interactions from ${file.name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setError(null);
        setSuccess(null);
      }, 3000);
    }
  }, [uploadMutation, onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isProcessing ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isProcessing ? "Processing CSV..." : "Upload Interactions Data"}
              </h3>
              <p className="text-muted-foreground">
                {isDragActive
                  ? "Drop the CSV file here..."
                  : "Drag and drop a CSV file here, or click to select"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports Genesys Cloud interaction export format
              </p>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing file...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Accepts CSV files only</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) onDrop(Array.from(files));
                };
                input.click();
              }}
              disabled={isProcessing}
            >
              Choose File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
