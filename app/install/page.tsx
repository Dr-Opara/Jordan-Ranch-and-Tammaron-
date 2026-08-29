import type { Metadata } from "next";
import PwaInstallPage from "@/components/pwa-install-page";

export const metadata: Metadata = {
  title: "Get the JRT.Community App",
  description: "Install JRT.Community directly on your iPhone or Android phone without an app store.",
};

export default function InstallPage() {
  return <PwaInstallPage />;
}
