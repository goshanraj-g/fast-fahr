import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import ViewModal from "../components/buyingComponents/ViewModal";
import "../components/css/buyingCSS/buyingpage.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NavBar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { fetchBookmarks, toggleBookmark } from "../hooks/useBookmarks";

/**
* Renders the Bookmarks page, showing saved listings for the logged-in user.
* @returns {JSX.Element|null} The BookmarksPage component or null if redirecting.
*/
export default function BookmarksPage() {
  const { currentUser, isLoading: authLoading, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [bookmarkedListings, setBookmarkedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewError, setViewError] = useState("");

  const [selectedListing, setSelectedListing] = useState(null);
  const [viewerImages, setViewerImages] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (authLoading) return;

    if (!currentUser) {
      requireAuth();
      if (isMounted) setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    fetchBookmarks()
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setBookmarkedListings(data);
          } else {
            setError("Failed to load bookmarks: Invalid data format.");
            setBookmarkedListings([]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(`Failed to load bookmarks: ${err.message}`);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, currentUser, requireAuth]);

  const handleBookmarkToggle = useCallback(async (listingId) => {
    try {
      await toggleBookmark(listingId, true);
      setBookmarkedListings((prev) => prev.filter((l) => l.id !== listingId));
      setError('');
    } catch (err) {
      setError("Couldn't remove bookmark, please try again");
    }
  }, []);

  const handleView = useCallback((listing) => {
    setViewError("");
    fetch(
      `${process.env.REACT_APP_API_BASE}/listings/get_listing_images.php?listing_id=${listing.id}`,
      {
        credentials: "omit",
      }
    )
      .then((res) => {
         if (!res.ok) {
             return res.text().then(text => { throw new Error(`Failed to load images: ${res.status}, ${text}`) });
         }
         return res.json();
      })
      .then((data) => {
         if (data.success && Array.isArray(data.data)) {
           setViewerImages(data.data);
           setSelectedListing(listing);
           setIsViewerOpen(true);
         } else {
           throw new Error(data.error || "Received invalid image data format.");
         }
      })
      .catch((error) => {
        setViewError(`Failed to load images: ${error.message}`);
        setIsViewerOpen(false);
        setSelectedListing(null);
        setViewerImages([]);
      });
  }, []);

  const handleContact = useCallback((creatorUserId, creatorUsername) => {
    navigate('/messages', {
      state: { openAddContactModal: true, prefillUsername: creatorUsername },
    });
  }, [currentUser, navigate]);

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="buying-page">
          <div className="buying-content-wrapper">
            <div className="my-listings-header">
              <h2>My Bookmarks</h2>
            </div>

            {error && <div className="error-banner">{error}</div>}
            {viewError && <div className="error-banner">{viewError}</div>}

            {!error && bookmarkedListings.length > 0 ? (
              <div className="my-listings-grid">
                {bookmarkedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    title={listing.title}
                    image={
                      listing.image_path
                        ? `${process.env.REACT_APP_STATIC_BASE || ''}${listing.image_path}`
                        : "/images/default-car.png"
                    }
                    price={listing.price}
                    mileage={listing.mileage}
                    city={listing.city}
                    province={listing.province}
                    year={listing.year}
                    isBookmarked={true}
                    onBookmarkToggle={() => handleBookmarkToggle(listing.id)}
                    onView={() => handleView(listing)}
                    onContact={() => handleContact(listing.user_id, listing.creator_username)}
                    context="buying"
                  />
                ))}
              </div>
            ) : !error ? (
              <p className="no-listings-message">
                You have no bookmarks saved.
              </p>
            ) : null }
          </div>
        </div>
      </div>

      {/* Render View Modal when open */}
      {isViewerOpen && selectedListing && (
        <ViewModal
          images={viewerImages}
          onClose={() => setIsViewerOpen(false)}
          title={selectedListing.title}
          year={selectedListing.year}
          price={selectedListing.price}
          description={selectedListing.description}
          specs={{
            Make: selectedListing.make,
            Model: selectedListing.model,
            Kilometers: `${Number(selectedListing.mileage).toLocaleString()} km`,
            Transmission: selectedListing.transmission,
            Drive: selectedListing.driveType,
            Fuel: selectedListing.fuelType,
            Body: selectedListing.bodyType,
            Exterior: selectedListing.exteriorColor,
            Location: `${selectedListing.city}, ${selectedListing.province}`,
          }}
        />
      )}

    </div>
  );
}