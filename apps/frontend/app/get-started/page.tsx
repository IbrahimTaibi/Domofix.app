import type { Metadata } from "next";
import { RoleChooser } from "@/features/get-started/components/role-chooser";

export const metadata: Metadata = {
  title: "Commencer — Domofix",
  description: "Choisissez comment vous souhaitez commencer sur Domofix.",
};

export default function GetStartedPage() {
  return <RoleChooser />
}
