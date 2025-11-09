import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("renders hero title and values (FR)", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { name: /à propos de domofix/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nos valeurs/i })).toBeInTheDocument();
    expect(screen.getByText(/fiabilité/i)).toBeInTheDocument();
    expect(screen.getByText(/confiance/i)).toBeInTheDocument();
  });

  it("shows team section (FR)", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { name: /notre équipe/i })).toBeInTheDocument();
    expect(screen.getByText(/fondateur/i)).toBeInTheDocument();
  });
});