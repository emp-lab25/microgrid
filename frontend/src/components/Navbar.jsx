import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
      <h1>Dashboard</h1>
      <ThemeToggle />
    </div>
  );
}
