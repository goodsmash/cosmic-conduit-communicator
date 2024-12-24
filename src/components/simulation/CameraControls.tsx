import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraControlsProps {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  presets: {
    name: string;
    position: [number, number, number];
    target?: [number, number, number];
  }[];
}

const CameraControls = ({ camera, controls, presets }: CameraControlsProps) => {
  const animationRef = useRef<number>();

  const animateCamera = (
    startPos: THREE.Vector3,
    endPos: THREE.Vector3,
    startTarget: THREE.Vector3,
    endTarget: THREE.Vector3
  ) => {
    const duration = 1000; // Animation duration in milliseconds
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate camera position
      camera.position.lerpVectors(startPos, endPos, eased);

      // Interpolate target
      const currentTarget = new THREE.Vector3();
      currentTarget.lerpVectors(startTarget, endTarget, eased);
      controls.target.copy(currentTarget);

      controls.update();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
  };

  const handlePresetClick = (preset: CameraControlsProps["presets"][0]) => {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(...preset.position);
    const endTarget = preset.target 
      ? new THREE.Vector3(...preset.target)
      : new THREE.Vector3(0, 0, 0);

    animateCamera(startPos, endPos, startTarget, endTarget);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card className="absolute top-4 right-4 p-4 bg-black/50 backdrop-blur-sm w-64 z-10">
      <h2 className="text-lg font-semibold mb-4">Camera Views</h2>
      <div className="space-y-2">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            className="w-full justify-start"
            onClick={() => handlePresetClick(preset)}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default CameraControls;
