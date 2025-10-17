import React from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NoPage />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
