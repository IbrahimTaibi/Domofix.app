import type { Metadata } from "next";
import { RoleChooser } from "@/components/get-started/role-chooser";

export const metadata: Metadata = {
  title: "Commencer — Tawa",
  description: "Choisissez comment vous souhaitez commencer sur Tawa.",
};

export default function GetStartedPage() {
  return <RoleChooser />
}
