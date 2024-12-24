import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SimulationControlsProps {
  title: string;
  speed: number;
  onSpeedChange: (value: number) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
  children?: React.ReactNode;
}

const SimulationControls = ({
  title,
  speed,
  onSpeedChange,
  isPaused,
  onPauseToggle,
  children,
}: SimulationControlsProps) => {
  return (
    <div className="absolute top-4 left-4 space-y-4 z-10">
      <Card className="p-4 bg-black/50 backdrop-blur-sm w-64">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-400">Simulation Speed</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[speed]}
                onValueChange={([value]) => onSpeedChange(value)}
                min={0.1}
                max={5}
                step={0.1}
                className="my-2"
              />
              <span className="text-sm text-gray-400 min-w-[3ch]">
                {speed.toFixed(1)}x
              </span>
            </div>
          </div>

          <Button
            onClick={onPauseToggle}
            variant="outline"
            className="w-full"
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </Card>

      {children}
    </div>
  );
};

export default SimulationControls;
