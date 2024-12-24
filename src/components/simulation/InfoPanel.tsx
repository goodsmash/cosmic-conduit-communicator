import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoPanelProps {
  title: string;
  properties: {
    label: string;
    value: string | number;
    tooltip?: string;
    unit?: string;
  }[];
  description?: string;
}

const InfoPanel = ({ title, properties, description }: InfoPanelProps) => {
  return (
    <Card className="p-4 bg-black/50 backdrop-blur-sm w-64">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="space-y-2 text-sm">
        {properties.map((prop) => (
          <div key={prop.label} className="flex justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-400 cursor-help">{prop.label}:</span>
                </TooltipTrigger>
                {prop.tooltip && (
                  <TooltipContent>
                    <p>{prop.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <span>
              {typeof prop.value === 'number' 
                ? prop.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : prop.value}
              {prop.unit && ` ${prop.unit}`}
            </span>
          </div>
        ))}
        {description && (
          <p className="text-gray-400 mt-4 text-sm">{description}</p>
        )}
      </div>
    </Card>
  );
};

export default InfoPanel;
