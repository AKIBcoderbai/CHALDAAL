import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent"; // Note lowercase 'c' in your file import if unchanged
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext"; // <--- Import

function App() {
  return (
    // Wrap everything in ThemeProvider
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;