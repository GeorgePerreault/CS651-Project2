
import { ReactNode } from "react";

interface AnalysisSectionProps {
  title: string;
  items?: string[];
  children?: ReactNode;
}

const AnalysisSection = ({ title, items, children }: AnalysisSectionProps) => {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {items ? (
        items.length > 0 ? (
          <ul className="grid gap-2">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border hover:bg-muted/50 transition-colors duration-200"
              >
                <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )
      ) : (
        children
      )}
    </div>
  );
};

export default AnalysisSection;