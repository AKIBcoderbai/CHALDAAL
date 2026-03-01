import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent"; 
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext"; 

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;