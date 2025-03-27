"use client"


import {
  BookOpen,
  Rocket,
  Heart,
  Skull,
  Sword,
  Laugh,
  Compass,
  Sparkles,
  Ghost,
  Lightbulb,
  Clock,
  BookMarked,
  BookText,
  Orbit,
  Monitor,
  FlaskRoundIcon as Flask,
  Feather,
  Building,
  Castle,
  Brain,
  Footprints,
  Infinity,
  Puzzle,
  Wand,
  BuildingIcon as Buildings,
  Moon,
  TelescopeIcon as Binoculars,
  Dog,
  UserCheck,
  Cigarette,
  Map,
  Tent,
  Mountain,
  Scroll,
  Bomb,
  Glasses,
  Frown,
  Pencil,
  Microscope,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const genres = [
    {
      id: "fiction",
      name: "Fiction",
      icon: BookOpen,
      color: "text-blue-500",
      styles: [
        { id: "contemporary", name: "Contemporary", icon: Building },
        { id: "historical", name: "Historical", icon: Clock },
        { id: "literary", name: "Literary", icon: BookText },
      ],
    },
    {
      id: "scifi",
      name: "Science Fiction",
      icon: Rocket,
      color: "text-purple-500",
      styles: [
        { id: "space-opera", name: "Space Opera", icon: Orbit },
        { id: "cyberpunk", name: "Cyberpunk", icon: Monitor },
        { id: "hard-scifi", name: "Hard Sci-Fi", icon: Flask },
      ],
    },
    {
      id: "romance",
      name: "Romance",
      icon: Heart,
      color: "text-pink-500",
      styles: [
        { id: "shakespearean", name: "Shakespearean", icon: Feather },
        { id: "contemporary", name: "Contemporary", icon: Building },
        { id: "regency", name: "Regency", icon: BookMarked },
        { id: "gothic", name: "Gothic", icon: Castle },
      ],
    },
    {
      id: "horror",
      name: "Horror",
      icon: Ghost,
      color: "text-red-600",
      styles: [
        { id: "psychological", name: "Psychological", icon: Brain },
        { id: "supernatural", name: "Supernatural", icon: Footprints },
        { id: "cosmic", name: "Cosmic", icon: Infinity },
      ],
    },
    {
      id: "fantasy",
      name: "Fantasy",
      icon: Sparkles,
      color: "text-amber-500",
      styles: [
        { id: "high-fantasy", name: "High Fantasy", icon: Wand },
        { id: "urban-fantasy", name: "Urban Fantasy", icon: Buildings },
        { id: "dark-fantasy", name: "Dark Fantasy", icon: Moon },
      ],
    },
    {
      id: "mystery",
      name: "Mystery",
      icon: Compass,
      color: "text-emerald-600",
      styles: [
        { id: "detective", name: "Detective", icon: Binoculars },
        { id: "cozy", name: "Cozy Mystery", icon: Dog },
        { id: "noir", name: "Noir", icon: Cigarette },
      ],
    },
    {
      id: "thriller",
      name: "Thriller",
      icon: Skull,
      color: "text-slate-700",
      styles: [
        { id: "psychological", name: "Psychological", icon: Brain },
        { id: "action", name: "Action", icon: Bomb },
        { id: "conspiracy", name: "Conspiracy", icon: Puzzle },
      ],
    },
    {
      id: "adventure",
      name: "Adventure",
      icon: Sword,
      color: "text-orange-500",
      styles: [
        { id: "exploration", name: "Exploration", icon: Map },
        { id: "survival", name: "Survival", icon: Tent },
        { id: "quest", name: "Quest", icon: Mountain },
      ],
    },
    {
      id: "comedy",
      name: "Comedy",
      icon: Laugh,
      color: "text-yellow-500",
      styles: [
        { id: "satire", name: "Satire", icon: Pencil },
        { id: "slapstick", name: "Slapstick", icon: Glasses },
        { id: "dark-comedy", name: "Dark Comedy", icon: Frown },
      ],
    },
    {
      id: "nonfiction",
      name: "Non-Fiction",
      icon: Lightbulb,
      color: "text-cyan-600",
      styles: [
        { id: "memoir", name: "Memoir", icon: UserCheck },
        { id: "historical", name: "Historical", icon: Scroll },
        { id: "scientific", name: "Scientific", icon: Microscope },
      ],
    },
  ]
  
 
export type SelectedGenre = {
  id: string
  style: string | null
}

type GenreDropdownProps = {
  selectedGenres: SelectedGenre[]
  onSelect: (genres: SelectedGenre[]) => void
}

export function GenreDropdown({ selectedGenres, onSelect }: GenreDropdownProps) {
  const handleGenreSelect = (genreId: string) => {
    const newSelection = selectedGenres.some(g => g.id === genreId)
      ? selectedGenres.filter(g => g.id !== genreId)
      : selectedGenres.length >= 2
        ? [selectedGenres[1], { id: genreId, style: null }]
        : [...selectedGenres, { id: genreId, style: null }]

    onSelect(newSelection)
  }

  const handleStyleSelect = (genreId: string, styleId: string) => {
    onSelect(selectedGenres.map(genre => 
      genre.id === genreId ? { ...genre, style: styleId } : genre
    ))
  }

  const getDisplayText = () => {
    if (selectedGenres.length === 0) return "Select genres"
    return selectedGenres.map(genre => {
      const genreData = genres.find(g => g.id === genre.id)!
      const style = genreData.styles.find(s => s.id === genre.style)
      return `${genreData.name}${style ? ` (${style.name})` : ""}`
    }).join(", ")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start truncate">
          {getDisplayText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]">
        <DropdownMenuLabel>Story Genres</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {genres.map((genre) => {
          const Icon = genre.icon
          const isSelected = selectedGenres.some(g => g.id === genre.id)
          const selectedStyle = selectedGenres.find(g => g.id === genre.id)?.style

          return (
            <DropdownMenuSub key={genre.id}>
              <DropdownMenuSubTrigger className={cn("flex items-center gap-2", isSelected && "font-medium")}>
                <Icon className={cn("h-4 w-4", genre.color)} />
                <span>{genre.name}</span>
                {isSelected && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {selectedGenres.findIndex(g => g.id === genre.id) + 1}/2
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={isSelected}
                    onSelect={(e) => {
                      e.preventDefault()
                      handleGenreSelect(genre.id)
                    }}
                  >
                    Select {genre.name}
                  </DropdownMenuCheckboxItem>

                  {isSelected && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Style</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={selectedStyle || ""}
                        onValueChange={(value) => handleStyleSelect(genre.id, value)}
                      >
                        {genre.styles.map((style) => {
                          const StyleIcon = style.icon
                          return (
                            <DropdownMenuRadioItem 
                              key={style.id} 
                              value={style.id} 
                              className="flex items-center gap-2"
                            >
                              <StyleIcon className={cn("h-4 w-4", genre.color)} />
                              <span>{style.name}</span>
                            </DropdownMenuRadioItem>
                          )
                        })}
                      </DropdownMenuRadioGroup>
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}