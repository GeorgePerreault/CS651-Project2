
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Toggle } from "@/components/ui/toggle";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
 

  return (
    <Toggle
      variant="outline"
      size="lg"
      pressed={theme === "dark"}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
      aria-label="Toggle theme"
      className="p-2.5 transition-all duration-300 ease-in-out"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Sun className="h-5 w-5 transition-all" />
      )}
    </Toggle>
  );
}
