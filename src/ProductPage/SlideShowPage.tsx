//import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StorySlideshow from "./StorySlideShow"
import Navbar from "./NavBar";

// Slide show for displaying stories instead of the default scroll bar
const StorySlideshowPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const analysis = state?.analysis;
  const imageUrls = state?.imageUrls;

  return (
    <>
      <Navbar />
      <StorySlideshow
        analysis={analysis}
        imageUrls={imageUrls}
        onClose={() => navigate("/")}
      />
    </>
  );
};

export default StorySlideshowPage;
