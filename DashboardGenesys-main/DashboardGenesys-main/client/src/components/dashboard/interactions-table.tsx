import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import type { Interaction } from "@/types/interaction";
import { formatDuration, getAgentInitials } from "@/lib/data-utils";

interface InteractionsTableProps {
  interactions: Interaction[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type SortField = 'mediaType' | 'agent' | 'customer' | 'startTime' | 'endTime' | 'duration' | 'direction' | 'queue' | 'wrapUp';
type SortDirection = 'asc' | 'desc';

export function InteractionsTable({ interactions }: InteractionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [filterColumn, setFilterColumn] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter interactions based on search term and column
  const filteredInteractions = interactions.filter(interaction => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (filterColumn === "all") {
      return (
        interaction.agent.toLowerCase().includes(searchLower) ||
        interaction.customer.toLowerCase().includes(searchLower) ||
        interaction.queue.toLowerCase().includes(searchLower) ||
        interaction.mediaType.toLowerCase().includes(searchLower) ||
        interaction.direction.toLowerCase().includes(searchLower) ||
        (interaction.wrapUp && interaction.wrapUp.toLowerCase().includes(searchLower)) ||
        (interaction.flow && interaction.flow.toLowerCase().includes(searchLower)) ||
        interaction.conversationId.toLowerCase().includes(searchLower)
      );
    }
    
    switch (filterColumn) {
      case "agent":
        return interaction.agent.toLowerCase().includes(searchLower);
      case "customer":
        return interaction.customer.toLowerCase().includes(searchLower);
      case "queue":
        return interaction.queue.toLowerCase().includes(searchLower);
      case "mediaType":
        return interaction.mediaType.toLowerCase().includes(searchLower);
      case "direction":
        return interaction.direction.toLowerCase().includes(searchLower);
      case "wrapUp":
        return interaction.wrapUp && interaction.wrapUp.toLowerCase().includes(searchLower);
      case "flow":
        return interaction.flow && interaction.flow.toLowerCase().includes(searchLower);
      case "conversationId":
        return interaction.conversationId.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  // Sort filtered interactions
  const sortedInteractions = [...filteredInteractions].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    // Handle different data types
    if (sortField === 'startTime' || sortField === 'endTime') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (sortField === 'duration') {
      aVal = a.duration;
      bVal = b.duration;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate sorted interactions
  const totalPages = Math.ceil(sortedInteractions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInteractions = sortedInteractions.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getWrapUpVariant = (wrapUp: string | null) => {
    if (!wrapUp) return "secondary";
    if (wrapUp.includes("TIMEOUT")) return "outline";
    if (wrapUp.includes("DELETED")) return "destructive";
    return "secondary";
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case "message":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "voice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "chat":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Interactions</h3>
          <div className="flex items-center space-x-2">
            <Select value={filterColumn} onValueChange={setFilterColumn}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="queue">Queue</SelectItem>
                <SelectItem value="mediaType">Media Type</SelectItem>
                <SelectItem value="direction">Direction</SelectItem>
                <SelectItem value="wrapUp">Wrap-up</SelectItem>
                <SelectItem value="flow">Flow</SelectItem>
                <SelectItem value="conversationId">Conversation ID</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${filterColumn === "all" ? "all columns" : filterColumn}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-64"
              />
            </div>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {paginatedInteractions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No interactions found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('mediaType')}>
                      <div className="flex items-center justify-between">
                        Media Type
                        {getSortIcon('mediaType')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('agent')}>
                      <div className="flex items-center justify-between">
                        Agent
                        {getSortIcon('agent')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('customer')}>
                      <div className="flex items-center justify-between">
                        Customer
                        {getSortIcon('customer')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('startTime')}>
                      <div className="flex items-center justify-between">
                        Date
                        {getSortIcon('startTime')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('endTime')}>
                      <div className="flex items-center justify-between">
                        End Date
                        {getSortIcon('endTime')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('duration')}>
                      <div className="flex items-center justify-between">
                        Duration
                        {getSortIcon('duration')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('direction')}>
                      <div className="flex items-center justify-between">
                        Direction
                        {getSortIcon('direction')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      ANI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      DNIS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('queue')}>
                      <div className="flex items-center justify-between">
                        Queue
                        {getSortIcon('queue')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-pointer hover:bg-muted" onClick={() => handleSort('wrapUp')}>
                      <div className="flex items-center justify-between">
                        Wrap-up
                        {getSortIcon('wrapUp')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Flow
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Conversation ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedInteractions.map((interaction) => (
                    <tr key={interaction.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={getMediaTypeColor(interaction.mediaType)}>
                          {interaction.mediaType === "message" ? "WhatsApp" : interaction.mediaType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {getAgentInitials(interaction.agent)}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium truncate max-w-32">
                              {interaction.agent}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm truncate max-w-32">{interaction.customer}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {format(new Date(interaction.startTime), "MM/dd/yy HH:mm")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {format(new Date(interaction.endTime), "MM/dd/yy HH:mm")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {formatDuration(interaction.duration)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge variant="outline">{interaction.direction}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {interaction.ani || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {interaction.dnis || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm truncate max-w-32">{interaction.queue}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {interaction.wrapUp ? (
                          <Badge variant={getWrapUpVariant(interaction.wrapUp)} className="text-xs">
                            {interaction.wrapUp.includes("TIMEOUT") ? "Timeout" : 
                             interaction.wrapUp.includes("DELETED") ? "Deleted" : "Complete"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm truncate max-w-32">{interaction.flow || "-"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-mono truncate max-w-24">{interaction.conversationId}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + pageSize, filteredInteractions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{sortedInteractions.length}</span>{" "}
                  interactions
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
