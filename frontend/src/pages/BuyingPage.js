import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ViewModal from "../components/buyingComponents/ViewModal";
import "../components/css/buyingCSS/buyingpage.css";
import filterListings from "../components/filterListingsComponent/filterListings";
import FilterModal from "../components/FilterModal";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ListingCard from "../components/ListingCard";
import NavBar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { fetchBookmarks, toggleBookmark } from "../hooks/useBookmarks";

function BuyingPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [viewerImages, setViewerImages] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [viewError, setViewError] = useState("");

  const normalize = (str) => str.toLowerCase().replace(/[\s-]/g, "");

  useEffect(() => {
    if (!authLoading) {
      setPageLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading) {
      let isMounted = true;
      setFetchError("");
      setPageLoading(true);

      fetch(`${process.env.REACT_APP_API_BASE}/listings/get_listings.php`, {
        credentials: "omit",
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(
                `HTTP error! status: ${res.status}, response: ${text}`
              );
            });
          }
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            if (data.success && Array.isArray(data.data)) {
              setListings(data.data);
              setFilteredListings(data.data);
            } else {
              setFetchError("Failed to load listings: Invalid data format.");
              setListings([]);
              setFilteredListings([]);
            }
          }
        })
        .catch((error) => {
          if (isMounted)
            setFetchError(`Failed to load listings: ${error.message}`);
        })
        .finally(() => {
          if (isMounted) setPageLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [authLoading]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      fetchBookmarks()
        .then((data) => {
          if (isMounted) {
            if (Array.isArray(data)) {
              setBookmarkedIds(new Set(data.map((post) => post.id)));
            } else {
              setBookmarkedIds(new Set());
            }
          }
        })
        .catch(() => {
          if (isMounted) setBookmarkedIds(new Set());
        });
    } else {
      if (isMounted) setBookmarkedIds(new Set());
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleBookmark = useCallback(
    async (id) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const isCurrentlyBookmarked = bookmarkedIds.has(id);
      try {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          isCurrentlyBookmarked ? next.delete(id) : next.add(id);
          return next;
        });
        await toggleBookmark(id, isCurrentlyBookmarked);
      } catch {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          isCurrentlyBookmarked ? next.add(id) : next.delete(id);
          return next;
        });
      }
    },
    [currentUser, navigate, bookmarkedIds]
  );

  const handleContact = useCallback(
    (creatorUserId, creatorUsername) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      navigate("/messages", {
        state: {
          openAddContactModal: true,
          prefillUsername: creatorUsername,
        },
      });
    },
    [currentUser, navigate]
  );

  const handleView = useCallback((car) => {
    fetch(
      `${process.env.REACT_APP_API_BASE}/listings/get_listing_images.php?listing_id=${car.id}`,
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
           setSelectedCar(car);
           setIsViewerOpen(true);
           setViewError("");
         } else {
           const errorMsg = data.error || "Received invalid image data format.";
           throw new Error(errorMsg);
         }
      })
      .catch((error) => {
        setViewError(`Failed to load images: ${error.message}`);
        setIsViewerOpen(false);
        setSelectedCar(null);
        setViewerImages([]);
      });
  }, []);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const applyFilters = useCallback(
    (filters) => {
      const filtered = filterListings(listings, filters);
      setFilteredListings(filtered);
      closeFilterModal();
    },
    [listings]
  );

  const clearFilters = useCallback(() => {
    setFilteredListings(listings);
    closeFilterModal();
  }, [listings]);

  const searchParam = new URLSearchParams(location.search).get("search") || "";

  const visibleListings = filteredListings.filter((car) => {
    if (!searchParam) return true;
    return normalize(car.title).includes(searchParam);
  });

  return (
    <div className="page-wrapper">

      <div className="page-content">
        <div className="buying-page">
          <div className="buying-content-wrapper">
            <div className="my-listings-header">
              <h2>Current Listings</h2>
              <button
                className="create-listing-btn-trigger"
                onClick={openFilterModal}
              >
                <i className="fas fa-filter"></i> Filter Listings
              </button>
            </div>

            {fetchError && <div className="error-banner">{fetchError}</div>}
            {viewError && <div className="error-banner">{viewError}</div>}

            {!fetchError && visibleListings.length > 0 ? (
            <div className="my-listings-grid">
              {visibleListings.map((car) => (
                <ListingCard
                  key={car.id}
                  listing={car}
                  title={car.title}
                  image={
                    car.image_path
                      ? `${process.env.REACT_APP_STATIC_BASE}${car.image_path}`
                      : "/images/default-car.png"
                  }
                  price={car.price}
                  mileage={car.mileage}
                  year={car.year}
                  city={car.city}
                  province={car.province}
                  isBookmarked={!!currentUser && bookmarkedIds.has(car.id)}
                  onBookmarkToggle={() => handleBookmark(car.id)}
                  onContact={() =>
                    handleContact(car.user_id, car.creator_username)
                  }
                  onView={() => handleView(car)}
                  context="buying"
                />
              ))}
            </div>
          ) : !fetchError ? (
            <p className="no-listings-message">
              No cars found matching the current filters.
            </p>
          ) : (
             null
          )}
          </div>

          {isFilterModalOpen && (
            <div className="modal-overlay" onClick={closeFilterModal}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <FilterModal
                  onApplyFilters={applyFilters}
                  onClearFilters={clearFilters}
                  isModal
                  onClose={closeFilterModal}
                />
              </div>
            </div>
          )}

          {isViewerOpen && selectedCar && (
            <ViewModal
              images={viewerImages}
              onClose={() => setIsViewerOpen(false)}
              title={selectedCar.title}
              year={selectedCar.year}
              price={selectedCar.price}
              description={selectedCar.description}
              specs={{
                Make: selectedCar.make,
                Model: selectedCar.model,
                Kilometers: `${Number(
                  selectedCar.mileage
                ).toLocaleString()} km`,
                Transmission: selectedCar.transmission,
                Drive: selectedCar.driveType,
                Body: selectedCar.bodyType,
                Exterior: selectedCar.exteriorColor,
                Fuel: selectedCar.fuelType,
                Location: `${selectedCar.city}, ${selectedCar.province}`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyingPage;