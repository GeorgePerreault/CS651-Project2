"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FilterSettings {
  tags: string[];
  dateRange: string | null;
  sortBy: string;
}

interface FilterDialogProps {
  allTags: string[];
  activeFilters: FilterSettings;
  setActiveFilters: (filters: FilterSettings) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFilteredArtworks: (artworks: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artworks: any[];
}

export function FilterDialog({
  allTags,
  activeFilters,
  setActiveFilters,
  setFilteredArtworks,
  artworks,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const dateOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisYear", label: "This Year" },
  ];

  const sortOptions = [
    { value: "newest", label: "Date (Newest)" },
    { value: "oldest", label: "Date (Oldest)" },
    { value: "titleAsc", label: "Title (A-Z)" },
    { value: "titleDesc", label: "Title (Z-A)" },
  ];

  const handleTagToggle = (tag: string) => {
    setLocalFilters((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  const applyFilters = () => {
    setActiveFilters(localFilters);

    // Start with all artworks
    let filtered = [...artworks];

    // Filter by tags if any are selected
    if (localFilters.tags.length > 0) {
      filtered = filtered.filter((artwork) =>
        artwork.tags.some((tag: string) => localFilters.tags.includes(tag))
      );
    }

    // Sort the results
    if (localFilters.sortBy === "newest") {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (localFilters.sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (localFilters.sortBy === "titleAsc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (localFilters.sortBy === "titleDesc") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    // Apply date range filters
    if (localFilters.dateRange === "last7days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      filtered = filtered.filter((artwork) => new Date(artwork.date) >= cutoff);
    } else if (localFilters.dateRange === "last30days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      filtered = filtered.filter((artwork) => new Date(artwork.date) >= cutoff);
    } else if (localFilters.dateRange === "thisYear") {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(
        (artwork) => new Date(artwork.date).getFullYear() === currentYear
      );
    }

    setFilteredArtworks(filtered);
    setOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters: FilterSettings = {
      tags: [],
      dateRange: null,
      sortBy: "newest",
    };
    setLocalFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setFilteredArtworks(artworks);
    setOpen(false);
  };

  // Update local filters when active filters change
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
          {(activeFilters.tags.length > 0 || activeFilters.dateRange) && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {activeFilters.tags.length +
                (activeFilters.dateRange ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Artworks</DialogTitle>
          <DialogDescription>
            Customize your view with these filter options
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <Accordion type="single" collapsible defaultValue="tags">
            <AccordionItem value="tags">
              <AccordionTrigger>Categories & Tags</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={localFilters.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label htmlFor={`tag-${tag}`} className="capitalize">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="date">
              <AccordionTrigger>Date Range</AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={localFilters.dateRange || "all"}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      dateRange: value === "all" ? null : value,
                    }))
                  }
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="all" id="all-dates" />
                    <Label htmlFor="all-dates">All Dates</Label>
                  </div>
                  {dateOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sort">
              <AccordionTrigger>Sort By</AccordionTrigger>
              <AccordionContent>
                <Select
                  value={localFilters.sortBy}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="sm:w-auto w-full"
          >
            Reset Filters
          </Button>
          <Button onClick={applyFilters} className="sm:w-auto w-full">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
