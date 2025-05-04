import React from "react";
import "./css/card.css";
import main_tile from "./images/PPP.png";

/**
* Renders the main promotional tile/card for the homepage.
* Does not currently accept dynamic props.
* @returns {JSX.Element} The main tile component.
*/
function Card({}) {
  return (
    <div className="main-tile">
      <img src={main_tile} alt="Main Tile" className="main-tile-image" />
      <div className="main-tile-content">
        <h3 className="main-tile-title">
          <strong>DRIVE FAST</strong>
        </h3>
        <h3 className="main-tile-title">
          <strong>DRIVE FAHR</strong>
        </h3>
      </div>
    </div>
  );
}

export default Card;
