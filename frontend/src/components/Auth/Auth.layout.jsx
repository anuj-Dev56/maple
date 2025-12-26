import React from "react";
import { GridScan } from "../Animations/GridScan";
import AuthBtn from "./AuthBtn";
import user from "../../utils/user";

const AuthPanel = () => {
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* FOREGROUND */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-white gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Welcome to</h1>
          <span className="text-5xl font-extrabold text-red-500 opacity-80">
            Maple
          </span>
        </div>

        <p className="text-sm text-gray-400 max-w-xs text-center">
          Sign in to continue and explore the Maple experience
        </p>

        {/* Google Button */}
        <div className="mt-4">
          <AuthBtn />
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
    </div>
  );
};

export default AuthPanel;
