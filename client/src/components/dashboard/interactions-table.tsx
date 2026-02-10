import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import type { Interaction } from "@/types/interaction";
import { formatDuration, getAgentInitials } from "@/lib/data-utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InteractionsTableProps {
  interactions: Interaction[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type SortField =
  | "mediaType"
  | "agent"
  | "customer"
  | "startTime"
  | "endTime"
  | "duration"
  | "direction"
  | "queue"
  | "wrapUp";
type SortDirection = "asc" | "desc";

type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  sortField?: SortField;
};

export function InteractionsTable({ interactions }: InteractionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [filterColumn, setFilterColumn] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: Set<string>;
  }>({});
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "mediaType",
      "agent",
      "customer",
      "startTime",
      "endTime",
      "duration",
      "direction",
      "queue",
    ]),
  );

  // Search terms for filter sections
  const [filterSearchTerms, setFilterSearchTerms] = useState<{
    [key: string]: string;
  }>({
    agent: "",
    queue: "",
    mediaType: "",
    direction: "",
  });

  // Define default column order
  const [columns, setColumns] = useState<Column[]>([
    {
      key: "mediaType",
      label: "Media Type",
      sortable: true,
      sortField: "mediaType",
    },
    { key: "agent", label: "Agent", sortable: true, sortField: "agent" },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      sortField: "customer",
    },
    { key: "startTime", label: "Date", sortable: true, sortField: "startTime" },
    { key: "endTime", label: "End Date", sortable: true, sortField: "endTime" },
    {
      key: "duration",
      label: "Duration",
      sortable: true,
      sortField: "duration",
    },
    {
      key: "direction",
      label: "Direction",
      sortable: true,
      sortField: "direction",
    },
    { key: "ani", label: "ANI", sortable: false },
    { key: "dnis", label: "DNIS", sortable: false },
    { key: "queue", label: "Queue", sortable: true, sortField: "queue" },
    { key: "wrapUp", label: "Wrap-up", sortable: true, sortField: "wrapUp" },
    { key: "flow", label: "Flow", sortable: false },
    { key: "conversationId", label: "Conversation ID", sortable: false },
  ]);

  // Get unique values for each filterable column
  const getUniqueValues = (columnKey: string) => {
    const values = interactions
      .map((interaction) => {
        switch (columnKey) {
          case "agent":
            return interaction.agent;
          case "queue":
            return interaction.queue;
          case "mediaType":
            return interaction.mediaType;
          case "direction":
            return interaction.direction;
          case "wrapUp":
            return interaction.wrapUp;
          default:
            return "";
        }
      }).filter((val): val is string => val !== null)
      .filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  // Get filtered values based on search term
  const getFilteredValues = (columnKey: string) => {
    const allValues = getUniqueValues(columnKey);
    const searchTerm = filterSearchTerms[columnKey]?.toLowerCase() || "";

    if (!searchTerm) return allValues;

    return allValues.filter(
      (value) => value && value.toLowerCase().includes(searchTerm),
    );
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Filter columns to show only visible ones
  const visibleColumnsList = columns.filter((column) =>
    visibleColumns.has(column.key),
  );

  // Filter interactions based on search term, column filters, and checkbox filters
  const filteredInteractions = interactions.filter((interaction) => {
    // Apply checkbox filters first
    const checkboxFilters = Object.keys(columnFilters);
    for (const columnKey of checkboxFilters) {
      const selectedValues = columnFilters[columnKey];
      if (selectedValues.size > 0) {
        let interactionValue = "";
        switch (columnKey) {
          case "agent":
            interactionValue = interaction.agent;
            break;
          case "queue":
            interactionValue = interaction.queue;
            break;
          case "mediaType":
            interactionValue = interaction.mediaType;
            break;
          case "direction":
            interactionValue = interaction.direction;
            break;
          case "wrapUp":
            interactionValue = interaction.wrapUp || "";
            break;
        }
        if (!selectedValues.has(interactionValue)) {
          return false;
        }
      }
    }

    // Apply search term filter
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    if (filterColumn === "all") {
      return (
        interaction.agent.toLowerCase().includes(searchLower) ||
        interaction.customer.toLowerCase().includes(searchLower) ||
        interaction.queue.toLowerCase().includes(searchLower) ||
        interaction.mediaType.toLowerCase().includes(searchLower) ||
        interaction.direction.toLowerCase().includes(searchLower) ||
        (interaction.wrapUp &&
          interaction.wrapUp.toLowerCase().includes(searchLower)) ||
        (interaction.flow &&
          interaction.flow.toLowerCase().includes(searchLower)) ||
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
        return (
          interaction.wrapUp &&
          interaction.wrapUp.toLowerCase().includes(searchLower)
        );
      case "flow":
        return (
          interaction.flow &&
          interaction.flow.toLowerCase().includes(searchLower)
        );
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
    if (sortField === "startTime" || sortField === "endTime") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (sortField === "duration") {
      aVal = a.duration;
      bVal = b.duration;
    } else {
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate sorted interactions
  const totalPages = Math.ceil(sortedInteractions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInteractions = sortedInteractions.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return (
        <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-50" />
      );
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, visibleIndex: number) => {
    setDraggedColumn(visibleIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropVisibleIndex: number) => {
    e.preventDefault();

    if (draggedColumn === null || draggedColumn === dropVisibleIndex) {
      setDraggedColumn(null);
      return;
    }

    // Work with the visible columns only
    const newVisibleColumns = [...visibleColumnsList];
    const draggedItem = newVisibleColumns[draggedColumn];

    // Remove the dragged item
    newVisibleColumns.splice(draggedColumn, 1);
    // Insert it at the new position
    newVisibleColumns.splice(dropVisibleIndex, 0, draggedItem);

    // Update the main columns array to maintain the new order
    const newColumns = [...columns];
    // Find and update positions for visible columns
    const reorderedKeys = newVisibleColumns.map((col) => col.key);
    const visibleColsMap = new Map(
      newVisibleColumns.map((col, idx) => [col.key, idx]),
    );

    newColumns.sort((a, b) => {
      const aVisible = visibleColumns.has(a.key);
      const bVisible = visibleColumns.has(b.key);

      if (aVisible && bVisible) {
        return (
          (visibleColsMap.get(a.key) || 0) - (visibleColsMap.get(b.key) || 0)
        );
      }
      if (aVisible && !bVisible) return -1;
      if (!aVisible && bVisible) return 1;
      return 0;
    });

    setColumns(newColumns);
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  // Checkbox filter handlers
  const handleCheckboxFilter = (
    columnKey: string,
    value: string,
    checked: boolean,
  ) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[columnKey]) {
        newFilters[columnKey] = new Set();
      }

      if (checked) {
        newFilters[columnKey].add(value);
      } else {
        newFilters[columnKey].delete(value);
      }

      // Remove empty filter sets
      if (newFilters[columnKey].size === 0) {
        delete newFilters[columnKey];
      }

      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Function to render cell content based on column key
  const renderCellContent = (interaction: Interaction, columnKey: string) => {
    switch (columnKey) {
      case "mediaType":
        return (
          <Badge className={getMediaTypeColor(interaction.mediaType)}>
            {interaction.mediaType === "message"
              ? "WhatsApp"
              : interaction.mediaType}
          </Badge>
        );
      case "agent":
        return (
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
        );
      case "customer":
        return (
          <div className="text-sm truncate max-w-32">
            {interaction.customer}
          </div>
        );
      case "startTime":
        return (
          <div className="text-sm">
            {format(new Date(interaction.startTime), "MMM dd, HH:mm")}
          </div>
        );
      case "endTime":
        return (
          <div className="text-sm">
            {format(new Date(interaction.endTime), "MMM dd, HH:mm")}
          </div>
        );
      case "duration":
        return (
          <div className="text-sm font-mono">
            {formatDuration(interaction.duration)}
          </div>
        );
      case "direction":
        return (
          <Badge
            variant={
              interaction.direction === "inbound" ? "default" : "secondary"
            }
          >
            {interaction.direction}
          </Badge>
        );
      case "ani":
        return (
          <div className="text-sm font-mono">{interaction.ani || "-"}</div>
        );
      case "dnis":
        return (
          <div className="text-sm font-mono">{interaction.dnis || "-"}</div>
        );
      case "queue":
        return (
          <div className="text-sm truncate max-w-32">{interaction.queue}</div>
        );
      case "wrapUp":
        return interaction.wrapUp ? (
          <Badge
            variant={getWrapUpVariant(interaction.wrapUp)}
            className="text-xs"
          >
            {interaction.wrapUp.split(";")[0]}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      case "flow":
        return (
          <div className="text-sm truncate max-w-24">
            {interaction.flow || "-"}
          </div>
        );
      case "conversationId":
        return (
          <div className="text-xs font-mono truncate max-w-24">
            {interaction.conversationId}
          </div>
        );
      default:
        return "-";
    }
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
            {/* Column Visibility Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Columns
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                    {visibleColumns.size}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Show/Hide Columns</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`column-${column.key}`}
                          checked={visibleColumns.has(column.key)}
                          onCheckedChange={() =>
                            toggleColumnVisibility(column.key)
                          }
                        />
                        <label
                          htmlFor={`column-${column.key}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisibleColumns(new Set(columns.map((c) => c.key)))
                      }
                    >
                      Show All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisibleColumns(
                          new Set(["mediaType", "agent", "startTime"]),
                        )
                      }
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Column Checkbox Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {Object.keys(columnFilters).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1 py-0 text-xs"
                    >
                      {Object.keys(columnFilters).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-4">
                    <h4 className="font-medium text-sm border-b pb-2">Filter by columns</h4>

                    {/* Agent Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Agent</label>
                        {columnFilters.agent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter("agent")}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search agents..."
                          value={filterSearchTerms.agent}
                          onChange={(e) =>
                            setFilterSearchTerms((prev) => ({
                              ...prev,
                              agent: e.target.value,
                            }))
                          }
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {getFilteredValues("agent").map((agent) => (
                          <div key={agent} className="flex items-center space-x-2">
                            <Checkbox
                              id={`agent-${agent}`}
                              checked={columnFilters.agent?.has(agent) || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxFilter(
                                  "agent",
                                  agent,
                                  checked as boolean,
                                )
                              }
                            />
                            <label
                              htmlFor={`agent-${agent}`}
                              className="text-sm cursor-pointer truncate flex-1"
                            >
                              {agent}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Queue Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Queue</label>
                        {columnFilters.queue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter("queue")}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search queues..."
                          value={filterSearchTerms.queue}
                          onChange={(e) =>
                            setFilterSearchTerms((prev) => ({
                              ...prev,
                              queue: e.target.value,
                            }))
                          }
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {getFilteredValues("queue").map((queue) => (
                          <div key={queue} className="flex items-center space-x-2">
                            <Checkbox
                              id={`queue-${queue}`}
                              checked={columnFilters.queue?.has(queue) || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxFilter(
                                  "queue",
                                  queue,
                                  checked as boolean,
                                )
                              }
                            />
                            <label
                              htmlFor={`queue-${queue}`}
                              className="text-sm cursor-pointer truncate flex-1"
                            >
                              {queue}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Media Type Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Media Type</label>
                        {columnFilters.mediaType && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter("mediaType")}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search media types..."
                          value={filterSearchTerms.mediaType}
                          onChange={(e) =>
                            setFilterSearchTerms((prev) => ({
                              ...prev,
                              mediaType: e.target.value,
                            }))
                          }
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {getFilteredValues("mediaType").map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`media-${type}`}
                              checked={columnFilters.mediaType?.has(type) || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxFilter(
                                  "mediaType",
                                  type,
                                  checked as boolean,
                                )
                              }
                            />
                            <label
                              htmlFor={`media-${type}`}
                              className="text-sm cursor-pointer truncate flex-1"
                            >
                              {type === "message" ? "WhatsApp" : type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direction Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Direction</label>
                        {columnFilters.direction && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter("direction")}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search directions..."
                          value={filterSearchTerms.direction}
                          onChange={(e) =>
                            setFilterSearchTerms((prev) => ({
                              ...prev,
                              direction: e.target.value,
                            }))
                          }
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {getFilteredValues("direction").map((dir) => (
                          <div key={dir} className="flex items-center space-x-2">
                            <Checkbox
                              id={`direction-${dir}`}
                              checked={columnFilters.direction?.has(dir) || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxFilter(
                                  "direction",
                                  dir,
                                  checked as boolean,
                                )
                              }
                            />
                            <label
                              htmlFor={`direction-${dir}`}
                              className="text-sm cursor-pointer truncate flex-1"
                            >
                              {dir}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

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
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
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
                  <tr key="table-header-row">
                    {visibleColumnsList.map((column, index) => (
                      <th
                        key={`header-${column.key}-${index}`}
                        className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group cursor-move hover:bg-muted/70 select-none ${
                          draggedColumn === index ? "opacity-50" : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() =>
                          column.sortable && column.sortField
                            ? handleSort(column.sortField)
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-70" />
                            {column.label}
                          </div>
                          {column.sortable &&
                            column.sortField &&
                            getSortIcon(column.sortField)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedInteractions.map((interaction, index) => (
                    <tr
                      key={`interaction-${interaction.id || interaction.conversationId}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {visibleColumnsList.map((column, colIndex) => (
                        <td
                          key={`cell-${interaction.id || interaction.conversationId}-${column.key}-${colIndex}`}
                          className="px-4 py-3 whitespace-nowrap"
                        >
                          {renderCellContent(interaction, column.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + pageSize,
                      filteredInteractions.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {sortedInteractions.length}
                  </span>{" "}
                  interactions
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
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
