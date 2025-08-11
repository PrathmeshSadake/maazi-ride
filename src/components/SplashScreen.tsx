import { useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <Image
        src="https://rue7vxma3l1fw7f7.public.blob.vercel-storage.com/logo-1CVOKE0vF98b1vePdlwuzupSDrHlGR.png"
        alt="Logo"
        width={200}
        height={200}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default SplashScreen;
