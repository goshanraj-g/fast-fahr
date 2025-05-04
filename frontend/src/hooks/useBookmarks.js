/**
 * Fetches the list of bookmarked posts for the currently logged-in user.
 * Assumes the backend uses session cookies for authentication.
 * @returns {Promise<Array>} A promise that resolves to an array of bookmarked post objects.
 * @throws {Error} Throws an error if the fetch fails or the backend returns an error.
 */
export async function fetchBookmarks() {
  const res = await fetch(`${process.env.REACT_APP_API_BASE}/bookmarks/list.php`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
}

/**
 * Toggles the bookmark status for a specific post.
 * Calls either the 'add' or 'remove' endpoint based on the current state.
 * @param {number|string} postId - The ID of the post to bookmark/unbookmark.
 * @param {boolean} isCurrentlyBookmarked - True if the post is currently bookmarked (will trigger remove), false otherwise (will trigger add).
 * @returns {Promise<boolean>} A promise that resolves to the new bookmark state (true if now bookmarked, false if now removed).
 * @throws {Error} Throws an error if the fetch fails or the backend returns an error.
 */
export async function toggleBookmark(postId, isBookmarked) {
  const url = `${process.env.REACT_APP_API_BASE}/bookmarks/${isBookmarked ? "remove" : "add"}.php`;
  const form = new FormData();
  form.append("post_id", postId);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return !isBookmarked;
}
