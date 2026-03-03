// @ts-nocheck
const API_URL = "https://snapgram-backend-cx31.onrender.com"; 
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// ============================== CREATE USER ACCOUNT (Spring Boot)
export async function createUserAccount(user: INewUser) {
  try {
    const response = await fetch(API_URL + "/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        bio: "",
      }),
    });

    if (!response.ok) throw new Error("Signup failed");
    return await response.json();
  } catch (error) {
    console.log("Error creating user:", error);
    return null; 
  }
}

// ============================== SIGN IN spring
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const response = await fetch(API_URL + "/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const loggedInUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(loggedInUser));

    return loggedInUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET ACCOUNT spring boot
export async function getAccount() {
  try {
    const userStr = localStorage.getItem("snapgram_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET CURRENT USER (Spring Boot)
export async function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("snapgram_user");
    if (!userStr) return null;
    const sessionUser = JSON.parse(userStr);

    const url = API_URL + "/api/users/" + sessionUser.id;
    const response = await fetch(url);
    if (!response.ok) return null;
    const user = await response.json();

    let fullSavedPosts: any[] = [];
    if (user.saves && user.saves.length > 0) {
      const promises = user.saves.map(async (postId: string) => {
        try {
          const postRes = await fetch(API_URL + "/api/posts/" + postId);
          if (postRes.ok) {
            const p = await postRes.json();
            return {
              $id: postId, 
              post: {
                $id: p.id.toString(),
                caption: p.caption || "",
                imageUrl: p.imageUrl || "",
                creator: {
                  name: p.creator?.name || "User",
                  imageUrl: p.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"
                }
              }
            };
          }
        } catch (e) { return null; }
        return null;
      });
      const results = await Promise.all(promises);
      fullSavedPosts = results.filter((res) => res !== null);
    }

    return {
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      bio: user.bio || "",
      followers: user.followers ? Array.from(user.followers) : [],
      following: user.following ? Array.from(user.following) : [],
      save: fullSavedPosts 
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT (Spring Boot / LocalStorage)
export async function signOutAccount() {
  try {
    localStorage.removeItem("snapgram_user");
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== UPLOAD FILE (Spring Boot)
export async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file); 

    const response = await fetch(API_URL + "/api/storage/upload", {
      method: "POST",
      body: formData, 
    });

    if (!response.ok) throw new Error("File upload failed");
    return await response.json(); 
  } catch (error) {
    console.log(error);
  }
}

// ============================== CREATE POST (Spring Boot)
export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error("File upload error");

    const tags = post.tags?.replace(/ /g, "") || "";

    const response = await fetch(API_URL + "/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: post.caption,
        location: post.location,
        tags: tags,
        imageUrl: uploadedFile.imageUrl,   
        imageId: uploadedFile.imageId,
        creator: { id: post.userId }       
      }),
    });

    if (!response.ok) throw new Error("Post creation failed");
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL (Spring Boot)
export function getFilePreview(fileId: string) {
  try {
    if (!fileId) return "";
    // Direct link tak, Localhost nahi!
    return 'https://snapgram-backend-cx31.onrender.com/api/storage/preview/${fileId}'; 
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS (SEARCH - Spring Boot)
export async function searchPosts(searchTerm: string) {
  try {
    if (!searchTerm) return { documents: [] };

    const url = API_URL + "/api/posts/search/" + searchTerm;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search posts");

    const posts = await response.json();

    const formattedPosts = posts.map((post: any) => ({
      $id: post.id ? post.id.toString() : Math.random().toString(),
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      imageId: post.imageId || "",
      location: post.location || "",
      tags: post.tags ? post.tags.split(",") : [],
      $createdAt: post.createdAt || new Date().toISOString(),
      creator: {
        $id: post.creator.id.toString(),
        name: post.creator.name,
        imageUrl: post.creator.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));

    return { documents: formattedPosts };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

// ============================== GET POST BY ID (Spring Boot)
export async function getPostById(postId?: string) {
  if (!postId) throw Error("No post ID");

  try {
    const url = API_URL + "/api/posts/" + postId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get post");
    
    const post = await response.json();
    
    return {
      $id: post.id.toString(),
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      imageId: post.imageId || "",
      location: post.location || "",
      tags: post.tags ? post.tags.split(",") : [],
      creator: {
        $id: post.creator.id.toString(),
        name: post.creator.name,
        imageUrl: post.creator.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    };
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST (Spring Boot)
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let finalImageUrl: any = post.imageUrl; 
    let finalImageId: any = post.imageId;

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error("File upload failed");

      const fileUrl = getFilePreview(uploadedFile.imageId || uploadedFile.$id);
      if (!fileUrl) throw Error("Failed to get file preview");

      finalImageUrl = fileUrl;
      finalImageId = uploadedFile.imageId || uploadedFile.$id;
    }

    const tagsString = post.tags ? post.tags.replace(/ /g, "") : "";
    const url = API_URL + "/api/posts/update/" + post.postId;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: post.caption,
        location: post.location,
        tags: tagsString,
        imageUrl: finalImageUrl,
        imageId: finalImageId
      })
    });

    if (!response.ok) throw new Error("Failed to update post");
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST (Spring Boot)
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId) return;

  try {
    const url = API_URL + "/api/posts/delete/" + postId;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete post");
    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST (Spring Boot)
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const url = API_URL + "/api/posts/like/" + postId;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(likesArray)
    });

    if (!response.ok) throw new Error("Failed to like post");
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST (Spring Boot)
export async function savePost(userId: string, postId: string) {
  try {
    const url = API_URL + "/api/users/save/" + userId + "/" + postId;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) throw new Error("Failed to save post");
    
    const updatedUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(updatedUser));
    return { $id: postId, post: { $id: postId } };
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST (Spring Boot)
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const userStr = localStorage.getItem("snapgram_user");
    if (!userStr) throw new Error("User not found in session");
    const user = JSON.parse(userStr);

    const url = API_URL + "/api/users/save/" + user.id + "/" + savedRecordId;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete saved post");

    const updatedUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(updatedUser));
    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POSTS (Spring Boot)
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const url = API_URL + "/api/posts/user/" + userId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch user posts");
    
    const posts = await response.json();
    
    const formattedPosts = posts.map((post: any) => ({
      $id: post.id.toString(),
      caption: post.caption,
      imageUrl: post.imageUrl,
      location: post.location,
      tags: post.tags ? post.tags.split(",") : [],
      $createdAt: post.createdAt || new Date().toISOString(),
      creator: {
        $id: post.creator.id.toString(),
        name: post.creator.name,
        imageUrl: post.creator.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));

    return { documents: formattedPosts };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET RECENT POSTS (Spring Boot)
export async function getRecentPosts() {
  try {
    const response = await fetch(API_URL + "/api/posts/recent", { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch posts");
    
    const posts = await response.json();
    
    if (!Array.isArray(posts)) return { documents: [] };

    const formattedPosts = posts.map((post: any) => ({
      $id: post?.id?.toString() || Math.random().toString(),
      caption: post?.caption || "",
      imageUrl: post?.imageUrl || "/assets/icons/image-placeholder.svg", 
      location: post?.location || "",
      tags: post?.tags ? post.tags.split(",") : [], 
      $createdAt: post?.createdAt || new Date().toISOString(),
      creator: {
        $id: post?.creator?.id?.toString() || "1",
        name: post?.creator?.name || "Unknown User",
        imageUrl: post?.creator?.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post?.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));

    return { documents: formattedPosts }; 
  } catch (error) {
    console.log("Error fetching recent posts:", error);
    return { documents: [] };
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET ALL USERS (Spring Boot)
export async function getUsers(limit?: number) {
  try {
    const url = API_URL + "/api/users/all";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get users");
    
    const users = await response.json();

    const formattedUsers = users.map((user: any) => ({
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      followers: user.followers ? Array.from(user.followers) : [],
      following: user.following ? Array.from(user.following) : [],
    }));

    return { documents: formattedUsers };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

// ============================== GET USER BY ID (Spring Boot)
export async function getUserById(userId: string) {
  try {
    const url = API_URL + "/api/users/" + userId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get user");
    
    const user = await response.json();

    const postsUrl = API_URL + "/api/posts/user/" + userId;
    const postsResponse = await fetch(postsUrl);
    const postsData = postsResponse.ok ? await postsResponse.json() : [];

    const formattedPosts = postsData.map((post: any) => ({
      $id: post.id ? post.id.toString() : Math.random().toString(),
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      imageId: post.imageId || "",
      creator: {
        $id: user.id.toString(),
        name: user.name,
        imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));
    
    return {
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      bio: user.bio || "",
      save: user.saves ? user.saves.map((postId: string) => ({ post: { $id: postId } })) : [],
      followers: user.followers ? Array.from(user.followers) : [],
      following: user.following ? Array.from(user.following) : [],
      posts: formattedPosts 
    };
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER (Spring Boot)
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = { imageUrl: user.imageUrl, imageId: user.imageId };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error("File error");

      const fileUrl = getFilePreview(uploadedFile.imageId || uploadedFile.$id);
      if (!fileUrl) throw Error("Preview error");

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.imageId || uploadedFile.$id };
    }

    const url = API_URL + "/api/users/update";
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.userId,
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId
      })
    });

    if (!response.ok) throw new Error("Failed to update user");
    
    const updatedUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(updatedUser));

    return {
       $id: updatedUser.id.toString(),
       name: updatedUser.name,
       imageUrl: updatedUser.imageUrl,
       bio: updatedUser.bio
    };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET INFINITE POSTS (Spring Boot)
export async function getInfinitePosts({ pageParam }: { pageParam?: any }) {
  try {
    if (pageParam) return { documents: [] };

    const url = API_URL + "/api/posts/recent";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch infinite posts");

    const posts = await response.json();

    const formattedPosts = posts.map((post: any) => ({
      $id: post.id ? post.id.toString() : Math.random().toString(),
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      imageId: post.imageId || "",
      location: post.location || "",
      tags: post.tags ? post.tags.split(",") : [],
      $createdAt: post.createdAt || new Date().toISOString(),
      creator: {
        $id: post.creator?.id?.toString() || "1",
        name: post.creator?.name || "Unknown",
        imageUrl: post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));

    return { documents: formattedPosts };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

// ============================== SEARCH USERS (Spring Boot)
export async function searchUsers(searchTerm: string) {
  try {
    if (!searchTerm) return { documents: [] };

    const url = API_URL + "/api/users/search/" + searchTerm;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search users");

    const users = await response.json();

    const formattedUsers = users.map((user: any) => ({
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      followers: user.followers ? Array.from(user.followers) : [],
      following: user.following ? Array.from(user.following) : [],
    }));

    return { documents: formattedUsers };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

// ============================== FOLLOW / UNFOLLOW USER (Spring Boot)
export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    const url = API_URL + "/api/users/follow/" + currentUserId + "/" + targetUserId;
    const response = await fetch(url, { method: "PUT" });
    if (!response.ok) throw new Error("Failed to toggle follow");

    const updatedCurrentUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(updatedCurrentUser));
    return updatedCurrentUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET LIKED POSTS (Spring Boot)
export async function getLikedPosts(userId: string) {
  try {
    const url = API_URL + "/api/posts/liked/" + userId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get liked posts");

    const posts = await response.json();

    const formattedPosts = posts.map((post: any) => ({
      $id: post.id.toString(),
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      imageId: post.imageId || "",
      location: post.location || "",
      tags: post.tags ? post.tags.split(",") : [],
      creator: {
        $id: post.creator.id.toString(),
        name: post.creator.name,
        imageUrl: post.creator.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
      likes: post.likes ? post.likes.map((likeId: string) => ({ $id: likeId })) : [],
      save: []
    }));

    return { documents: formattedPosts };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}