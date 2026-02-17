import { MeshGradient, NeuroNoise, DotOrbit, Waves } from "@paper-design/shaders-react";

const defaultColors = ["#4A90D9", "#89CFF0", "#D4A5FF", "#F7F6F3"];

interface ShaderBannerProps {
  shader?: string;
  colors?: string[];
  height?: string;
  className?: string;
}

export function ShaderBanner({ shader = "mesh-gradient", colors, height = "200px", className }: ShaderBannerProps) {
  const shaderColors = colors || defaultColors;

  const commonStyle = { width: "100%", height, borderRadius: "var(--tile-radius)" };

  if (shader === "mesh-gradient") {
    return (
      <MeshGradient
        style={commonStyle}
        className={className}
        colors={shaderColors}
        speed={0.2}
      />
    );
  }

  if (shader === "neuro-noise") {
    return (
      <NeuroNoise
        style={commonStyle}
        className={className}
        colorFront={shaderColors[0] || defaultColors[0]}
        colorMid={shaderColors[1] || defaultColors[1]}
        colorBack={shaderColors[2] || defaultColors[2]}
        speed={0.2}
        scale={1.5}
      />
    );
  }

  if (shader === "dot-orbit") {
    return (
      <DotOrbit
        style={commonStyle}
        className={className}
        colors={shaderColors}
        colorBack={shaderColors[shaderColors.length - 1] || "#F7F6F3"}
        speed={0.2}
        scale={0.3}
      />
    );
  }

  if (shader === "waves") {
    return (
      <Waves
        style={commonStyle}
        className={className}
        colorFront={shaderColors[0] || defaultColors[0]}
        colorBack={shaderColors[1] || defaultColors[1]}
      />
    );
  }

  return null;
}
