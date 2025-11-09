import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

describe("ContactPage", () => {
  it("renders hero and sections (FR)", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { name: /contactez-nous/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /moyens de contact/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /envoyer un message/i })).toBeInTheDocument();
  });

  it("shows form labels (FR)", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });
});