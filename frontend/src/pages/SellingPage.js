import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ListingCard from "../components/ListingCard.js";
import NavBar from "../components/Navbar";
import ViewModal from "../components/buyingComponents/ViewModal";
import "../components/css/sellingCSS/sellingpage.css";
import CreateListingForm from "../components/sellingComponents/CreateListingForm.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditListingForm from "../components/sellingComponents/EditListingForm.js";
import { useAuth } from "../hooks/useAuth";

function SellingPage() {
  const { currentUser, isLoading: authLoading, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [viewerImages, setViewerImages] = useState([]);
  const [viewError, setViewError] = useState("");

  const fetchMyListings = useCallback(async () => {
    setFetchError("");
    setPageLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/listings/get_listings.php`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const responseData = await response.json();

      if (responseData.success && Array.isArray(responseData.data)) {
        const allListings = responseData.data;
        const userSpecificListings = currentUser?.id
          ? allListings.filter((listing) => listing.user_id === currentUser.id)
          : [];
        setMyListings(userSpecificListings);
        setFetchError('');
      } else {
        throw new Error(responseData.error || "Invalid data format received.");
      }
    } catch (error) {
      setFetchError(`Failed to load listings: ${error.message}`);
      setMyListings([]);
    } finally {
      setPageLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    if (!authLoading) {
      if (!requireAuth()) {
        if (isMounted) setPageLoading(false);
      } else if (currentUser && isMounted) {
        fetchMyListings();
      } else {
         if(isMounted) setPageLoading(false);
      }
    } else {
       if(isMounted) setPageLoading(true);
    }
    return () => { isMounted = false; };
  }, [authLoading, currentUser, requireAuth, fetchMyListings]);

  const openCreateModal = () => { if (!requireAuth()) return; setIsCreateModalOpen(true); };
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const handleListingCreated = (newListing) => {
    if (newListing?.id) { setMyListings(prev => [newListing, ...prev]); }
    closeCreateModal();
  };
  const openEditModal = useCallback((listing) => { if (!requireAuth()) return; setListingToEdit(listing); setIsEditModalOpen(true); }, [requireAuth]);
  const closeEditModal = useCallback(() => { setIsEditModalOpen(false); setListingToEdit(null); }, []);
  const handleListingUpdated = useCallback((updatedListing) => {
      if (updatedListing?.id) { setMyListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l)); }
      closeEditModal();
  }, [closeEditModal]);
  const openDeleteConfirmModal = useCallback((id, title) => { if (!requireAuth()) return; setListingToDelete({ id, title }); setDeleteError(""); setIsDeleteModalOpen(true); }, [requireAuth]);
  const closeDeleteConfirmModal = useCallback(() => { if (isDeleting) return; setIsDeleteModalOpen(false); setListingToDelete(null); setDeleteError(""); }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
        const params = new URLSearchParams();
        params.append('listing_id', listingToDelete.id);

        const response = await fetch(
            `${process.env.REACT_APP_API_BASE}/listings/delete_listings.php`,
            {
                method: "POST",
                headers: {
                },
                credentials: "include",
                body: params
            }
        );

        const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error || `HTTP error ${response.status}`);
          }
              setMyListings(current => current.filter(listing => listing.id !== listingToDelete.id));
              closeDeleteConfirmModal();
          } catch (error) {
              setDeleteError(error.message || "Deletion error.");
          }
          finally {
              setIsDeleting(false);
          }
        }, [listingToDelete, closeDeleteConfirmModal, setMyListings]);

  const handleView = useCallback((listing) => {
    setViewError("");
    fetch(
      `${process.env.REACT_APP_API_BASE}/listings/get_listing_images.php?listing_id=${listing.id}`,
      { credentials: "omit" }
    )
      .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(` ${res.status}, ${text}`) });
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setViewerImages(data.data);
          setSelectedListing(listing);
          setIsViewerOpen(true);
        } else { throw new Error(data.error || "Invalid image data."); }
      })
      .catch(error => {
        setViewError("Failed to load images. Please try again.");
        setIsViewerOpen(false);
      });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="selling-page">
          <div className="selling-content-wrapper">
            <div className="my-listings-header">
              <h2>My Listings</h2>
              <button className="create-listing-btn-trigger" onClick={openCreateModal}>
                <i className="fas fa-plus"></i> Create Listing
              </button>
            </div>

            {fetchError && <div className="error-banner">{fetchError}</div>}
            {viewError && <div className="error-banner">{viewError}</div>}

            <section className="my-listings-section">
              {!fetchError && myListings.length > 0 ? (
                <div className="my-listings-grid">
                  {myListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      title={listing.title}
                      image={ listing.image_path ? `${process.env.REACT_APP_STATIC_BASE}${listing.image_path}` : "/images/default-car.png" }
                      price={listing.price}
                      mileage={listing.mileage}
                      year={listing.year}
                      city={listing.city}
                      province={listing.province}
                      onView={() => handleView(listing)}
                      onEdit={() => openEditModal(listing)}
                      onDelete={() => openDeleteConfirmModal(listing.id, listing.title)}
                      context="selling"
                    />
                  ))}
                </div>
              ) : !fetchError ? (
                <p className="no-listings-message">You haven't created any listings yet.</p>
              ) : null}
            </section>

            {/* That Modal Rendering Logic */}
            {isCreateModalOpen && (
              <div className="modal-overlay" onClick={closeCreateModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <CreateListingForm onSubmitSuccess={handleListingCreated} onClose={closeCreateModal} />
                </div>
              </div>
            )}

            {isEditModalOpen && listingToEdit && (
              <div className="modal-overlay" onClick={closeEditModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <EditListingForm listingToEdit={listingToEdit} onSubmitSuccess={handleListingUpdated} onClose={closeEditModal} />
                </div>
              </div>
            )}

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteConfirmModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title="Delete Listing"
                bodyText={`Are you sure you want to permanently delete this listing: "${listingToDelete?.title || ''}"?`}
                warningText="This action cannot be undone."
                confirmText="Delete"
                confirmIcon="fa-trash-alt"
                cancelText="Cancel"
                errorText={deleteError}
            />

           {isViewerOpen && selectedListing && (
                <ViewModal
                  images={viewerImages}
                  onClose={() => setIsViewerOpen(false)}
                  title={selectedListing.title} year={selectedListing.year} price={selectedListing.price}
                  description={selectedListing.description}
                  specs={{
                    Make: selectedListing.make, Model: selectedListing.model,
                    Kilometers: Number(selectedListing.mileage).toLocaleString(), Transmission: selectedListing.transmission,
                    Drive: selectedListing.driveType, Fuel: selectedListing.fuelType, Body: selectedListing.bodyType,
                    Exterior: selectedListing.exteriorColor, Location: `${selectedListing.city}, ${selectedListing.province}`,
                  }}
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellingPage;