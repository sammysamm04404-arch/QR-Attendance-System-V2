import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./styles/base/theme.css";
import "./styles/base/index.css";
import App from './App.jsx';
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration:3000,
          style:{
            borderRadius:"12px",
            background:"#ffffff",
            color:"#1e293b",
            fontSize:"15px",
            padding:"14px 18px"
          },

          success:{
            iconTheme:{
              primary:"#22c55e",
              secondary:"#fff"
            }
          },

          error:{
            iconTheme:{
              primary:"#ef4444",
              secondary:"#fff"
            }
          }
        }}
      />

  </StrictMode>,
)
