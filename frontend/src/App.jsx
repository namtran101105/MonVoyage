import { TripProvider } from "./context/TripContext";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <TripProvider>
      <HomePage />
    </TripProvider>
  );
}
