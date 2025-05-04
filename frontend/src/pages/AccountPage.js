import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "../components/css/homeCSS/homepage.css";
import "../components/css/accountCSS/manageAccount.css";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Renders the account management page where users can update their profile.
 * @returns {JSX.Element} The AccountPage component.
 */
function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading, updateAuthUser } = useAuth();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
    currentProfilePicture: null,
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser) {
      setUserData((prevState) => ({
        ...prevState,
        username: currentUser.username || "",
        email: currentUser.email || "",
        currentProfilePicture: currentUser.profile_picture || null,
      }));
    }
  }, [authLoading, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
       setUserData((prevState) => ({
         ...prevState,
         profilePicture: e.target.files[0],
       }));
    } else {
         setUserData((prevState) => ({
            ...prevState,
            profilePicture: null,
        }));
    }
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("username", userData.username);
      formData.append("email", userData.email);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/user/update_info.php`,
        { method: "POST", credentials: "include", body: formData }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
         throw new Error(data.error || `HTTP error ${response.status}`);
      }

      setMessage({ text: data.message || "Profile information updated successfully!", type: "success" });
    } catch (error) {
      setMessage({ text: error.message || "An error occurred. Please try again later.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
     e.preventDefault();
     if (userData.newPassword !== userData.confirmPassword) {
       setMessage({ text: "New passwords do not match.", type: "error" });
       return;
     }
     if (userData.newPassword.length < 8) {
        setMessage({ text: "New password must be at least 8 characters long.", type: "error" });
        return;
     }
     setIsSubmitting(true);
     setMessage({ text: "", type: "" });

     try {
       const response = await fetch(
         `${process.env.REACT_APP_API_BASE}/user/update_password.php`,
         {
           method: "POST",
           credentials: "include",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             currentPassword: userData.currentPassword,
             newPassword: userData.newPassword,
           }),
         }
       );
       const data = await response.json();

       if (!response.ok || !data.success) {
          throw new Error(data.error || `HTTP error ${response.status}`);
       }

       setMessage({ text: data.message || "Password updated successfully!", type: "success" });
       setUserData((prevState) => ({
         ...prevState, currentPassword: "", newPassword: "", confirmPassword: "",
       }));
     } catch (error) {
       setMessage({ text: error.message || "An error occurred. Please try again later.", type: "error" });
     } finally {
       setIsSubmitting(false);
     }
  };

  const handleProfilePictureUpdate = async (e) => {
      e.preventDefault();
      if (!userData.profilePicture) {
          setMessage({ text: "Please select a file to upload.", type: "error" });
          return;
      }
      setIsSubmitting(true);
      setMessage({ text: "", type: "" });

      try {
          const formData = new FormData();
          formData.append("profilePicture", userData.profilePicture);

          const response = await fetch(
              `${process.env.REACT_APP_API_BASE}/user/update_picture.php`,
              { method: "POST", credentials: "include", body: formData }
          );
          const data = await response.json();

          if (!response.ok || !data.success) {
             throw new Error(data.error || data.message || `HTTP error ${response.status}`);
          }

          const newImagePath = data.data?.profile_picture;

          if (newImagePath) {
            setMessage({ text: data.message || "Profile picture updated successfully!", type: "success" });
            setUserData((prevState) => ({
                ...prevState,
                currentProfilePicture: newImagePath,
                profilePicture: null,
            }));

            updateAuthUser({profile_picture: newImagePath});
            const fileInput = document.getElementById("profilePicture");
            if (fileInput) fileInput.value = "";
          } else {
             throw new Error("Profile picture path was missing in the server response.");
          }

      } catch (error) {
          setMessage({ text: error.message || "An error occurred during upload. Please try again later.", type: "error" });
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="home-page">

      <div className="account-container">
        <h1>Manage Your Account</h1>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {/* Main content area with different sections */}
        <div className="account-sections">

          {/* Section 1: Profile Picture */}
          <section className="account-section">
            <h2>Profile Picture</h2>
            <form onSubmit={handleProfilePictureUpdate}>
              <div className="profile-picture-container">
                <div className="current-picture">
                  {userData.currentProfilePicture ? (
                    <img
                      src={`${process.env.REACT_APP_STATIC_BASE}${userData.currentProfilePicture}`}
                      alt="Current profile"
                      className="profile-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
                    />
                  ) : (
                    <div className="profile-placeholder">
                      {/* Display first initial or a default icon */}
                      {userData.username ? userData.username.charAt(0).toUpperCase() : <i className="fas fa-user"></i>}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="profilePicture">Upload New Picture</label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif, image/webp"
                  />
                  <small>Max 5MB. JPG, PNG, GIF, WEBP allowed.</small>
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting || !userData.profilePicture}>
                {isSubmitting ? "Uploading..." : "Update Profile Picture"}
              </button>
            </form>
          </section>

          {/* Section 2: Profile Information */}
          <section className="account-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleInfoUpdate}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={userData.username} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={userData.email} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Information"}
              </button>
            </form>
          </section>

          {/* Section 3: Change Password */}
          <section className="account-section">
             <h2>Change Password</h2>
             <form onSubmit={handlePasswordUpdate}>
                 <div className="form-group">
                     <label htmlFor="currentPassword">Current Password</label>
                     <input type="password" id="currentPassword" name="currentPassword" value={userData.currentPassword} onChange={handleInputChange} required />
                 </div>
                 <div className="form-group">
                     <label htmlFor="newPassword">New Password</label>
                     <input type="password" id="newPassword" name="newPassword" value={userData.newPassword} onChange={handleInputChange} required minLength="8" />
                 </div>
                 <div className="form-group">
                     <label htmlFor="confirmPassword">Confirm New Password</label>
                     <input type="password" id="confirmPassword" name="confirmPassword" value={userData.confirmPassword} onChange={handleInputChange} required minLength="8" />
                 </div>
                 <button type="submit" className="submit-btn" disabled={isSubmitting}>
                     {isSubmitting ? "Updating..." : "Update Password"}
                 </button>
             </form>
          </section>

        </div>
      </div>
      
    </div>
  );
}

export default AccountPage;