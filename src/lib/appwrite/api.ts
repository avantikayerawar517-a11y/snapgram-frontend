const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// ============================== CREATE USER ACCOUNT (Spring Boot)
export async function createUserAccount(user: INewUser) {
  try {
    const response = await fetch("http://localhost:8080/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        bio: "", // default blank bio
      }),
    });

    if (!response.ok) throw new Error("Signup failed");
    
    // Spring boot kadhun aalela navin user return karto
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.log("Error creating user:", error);
    // Error aala tar 'null' return kara, mhanje form madhe fail chi condition chalel
    return null; 
  }
}

// ============================== SIGN IN spring
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const response = await fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });

    if (!response.ok) throw new Error("Login failed");

    // Backend kadhun aalela user ghe
    const loggedInUser = await response.json();

    // Browser chya LocalStorage madhe user save kar (Session sarkha)
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
    // Current user aapan local storage madhun ghet ahot
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

    // Backend kadhun fresh user ghe
    const url = "http://localhost:8080/api/users/" + sessionUser.id;
    const response = await fetch(url);
    if (!response.ok) return null;
    const user = await response.json();

    // MAGIC: Saved Posts chya IDs varun purna Post chi mahiti (image, caption) aaanne
    let fullSavedPosts: any[] = [];
    if (user.saves && user.saves.length > 0) {
      const promises = user.saves.map(async (postId: string) => {
        try {
          const postRes = await fetch("http://localhost:8080/api/posts/" + postId);
          if (postRes.ok) {
            const p = await postRes.json();
            return {
              $id: postId, // Save record cha ID
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
      // Sagle posts aalyavar array madhe jama kar
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
      save: fullSavedPosts // Aata ithe purna post chi image aani data jail!
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
// ============================== SIGN OUT (Spring Boot / LocalStorage)
export async function signOutAccount() {
  try {
    // Appwrite session delete karnyavaji, aapan direct local storage clear karu
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
    formData.append("file", file); // Ithe "file" navach thevla ahe (StorageController sathi)

    const response = await fetch("http://localhost:8080/api/storage/upload", {
      method: "POST",
      body: formData, // FormData wapartana Headers madhe Content-Type takaychi garaj naste
    });

    if (!response.ok) throw new Error("File upload failed");
    
    const data = await response.json();
    return data; // { imageId: "...", imageUrl: "..." }
  } catch (error) {
    console.log(error);
  }
}

// ============================== CREATE POST (Spring Boot)
export async function createPost(post: INewPost) {
  try {
    // 1. Saglyat aadhi photo upload kar
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // Tags la string madhe convert kar
    const tags = post.tags?.replace(/ /g, "") || "";

    // 2. Photo upload jhalyavar purna Post database madhe save kar
    const response = await fetch("http://localhost:8080/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: post.caption,
        location: post.location,
        tags: tags,
        imageUrl: uploadedFile.imageUrl,   // Storage API ne dileli direct link
        imageId: uploadedFile.imageId,
        creator: { id: post.userId }       // Kontya user ne post keli tyachi ID
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
    
    // Backticks kadhun simple double quotes aani + waparla ahe
    return "http://localhost:8080/api/storage/preview/" + fileId;
  } catch (error) {
    console.log(error);
  }
}


// ============================== GET POSTS (SEARCH - Spring Boot)
export async function searchPosts(searchTerm: string) {
  try {
    // Jar searchTerm rikama asel tar API la call karu nako
    if (!searchTerm) return { documents: [] };

    // Simple string addition to avoid URL errors
    const url = "http://localhost:8080/api/posts/search/" + searchTerm;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search posts");

    const posts = await response.json();

    // React la Appwrite chya format madhe data hava asto
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
  if (!postId) throw Error;

  try {
    const url = "http://localhost:8080/api/posts/" + postId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get post");
    
    const post = await response.json();
    
    // UI la Appwrite format lagto
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
    // TypeScript che errors avoid karnyasaathi aapan simple variables waparuyat
    let finalImageUrl: any = post.imageUrl; 
    let finalImageId: any = post.imageId;

    if (hasFileToUpdate) {
      // Navin image upload kar
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error("File upload failed");

      const fileUrl = getFilePreview(uploadedFile.imageId || uploadedFile.$id);
      if (!fileUrl) throw Error("Failed to get file preview");

      // Jar navin image aali tar variables update kar
      finalImageUrl = fileUrl;
      finalImageId = uploadedFile.imageId || uploadedFile.$id;
    }

    const tagsString = post.tags ? post.tags.replace(/ /g, "") : "";
    const url = "http://localhost:8080/api/posts/update/" + post.postId;
    
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
    const url = "http://localhost:8080/api/posts/delete/" + postId;
    const response = await fetch(url, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error("Failed to delete post");

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}
// ============================== LIKE / UNLIKE POST (Spring Boot)
export async function likePost(postId: string, likesArray: string[]) {
  try {
    // Ithe aapan simple double quotes aani + waparla ahe (error yeu naye mhanun)
    const url = "http://localhost:8080/api/posts/like/" + postId;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(likesArray)
    });

    if (!response.ok) {
      throw new Error("Failed to like post");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
// ============================== SAVE POST (Spring Boot)
export async function savePost(userId: string, postId: string) {
  try {
    // URL banvnyasathi simple string addition (+) waparli ahe
    const url = "http://localhost:8080/api/users/save/" + userId + "/" + postId;
    
    const response = await fetch(url, { 
      method: "POST" 
    });
    
    if (!response.ok) {
      throw new Error("Failed to save post");
    }
    
    // Spring Boot kadhun aalela updated user parat LocalStorage madhe save kar
    const updatedUser = await response.json();
    localStorage.setItem("snapgram_user", JSON.stringify(updatedUser));

    // React la Appwrite sarakha Object hava asto, to banvun return kar
    return { $id: postId, post: { $id: postId } };
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST (Spring Boot)
export async function deleteSavedPost(savedRecordId: string) {
  try {
    // Aplayla User ID hava ahe, to aapan LocalStorage madhun gheu
    const userStr = localStorage.getItem("snapgram_user");
    if (!userStr) {
      throw new Error("User not found in session");
    }
    const user = JSON.parse(userStr);

    // URL banvnyasathi simple string addition (+)
    const url = "http://localhost:8080/api/users/save/" + user.id + "/" + savedRecordId;
    
    const response = await fetch(url, { 
      method: "DELETE" 
    });

    if (!response.ok) {
      throw new Error("Failed to delete saved post");
    }

    // Parat updated user LocalStorage madhe tak
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
    const url = "http://localhost:8080/api/posts/user/" + userId;
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
    const response = await fetch("http://localhost:8080/api/posts/recent", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    
    const posts = await response.json();
    
    // Jar backend ne array chya jagi error pathavla asel tar crash vachvnyasaathi
    if (!Array.isArray(posts)) {
      console.log("Backend did not return an array:", posts);
      return { documents: [] };
    }

    // Safe mapping (?.) waparun
    const formattedPosts = posts.map((post: any) => ({
      $id: post?.id?.toString() || Math.random().toString(),
      caption: post?.caption || "",
      imageUrl: post?.imageUrl || "/assets/icons/image-placeholder.svg", // Jar image nsel tar default disel
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
    const url = "http://localhost:8080/api/users/all";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get users");
    
    const users = await response.json();

    const formattedUsers = users.map((user: any) => ({
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      // Hi magic line add keli ahe jyamule Follow button chalel:
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
    // 1. Aadhi User chi mahiti ghe
    const url = "http://localhost:8080/api/users/" + userId;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to get user");
    
    const user = await response.json();

    // 2. Tya user che sagle Posts ghe (Profile page var dakhvnyasaathi)
    const postsUrl = "http://localhost:8080/api/posts/user/" + userId;
    const postsResponse = await fetch(postsUrl);
    const postsData = postsResponse.ok ? await postsResponse.json() : [];

    // 3. Posts la Appwrite chya format madhe convert kar
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
    
    // 4. User aani tyache posts ekatra return kar
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
      posts: formattedPosts // <-- Aadhi ithe rikama array hota, aata sagle posts alet!
    };
  } catch (error) {
    console.log(error);
  }
}
// ============================== UPDATE USER (Spring Boot)
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Navin photo upload kar
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.imageId || uploadedFile.$id);
      if (!fileUrl) throw Error;

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.imageId || uploadedFile.$id };
    }

    const url = "http://localhost:8080/api/users/update";
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
    
    // LocalStorage madhe update kela mhanje lagech navin photo disel
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
    // 🛑 MAGIC FIX: Jar React ne 2nd page magitla (scroll kelyavar), 
    // tar tyala rikama array deun sanga "Aata posts sample!" mhanje to loop thambvel.
    if (pageParam) {
      return { documents: [] };
    }

    const url = "http://localhost:8080/api/posts/recent";
    
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

    const url = "http://localhost:8080/api/users/search/" + searchTerm;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("Failed to search users");

    const users = await response.json();

    const formattedUsers = users.map((user: any) => ({
      $id: user.id.toString(),
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      // Hi magic line search results madhe pan add keli ahe:
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
    const url = "http://localhost:8080/api/users/follow/" + currentUserId + "/" + targetUserId;
    const response = await fetch(url, { method: "PUT" });
    
    if (!response.ok) throw new Error("Failed to toggle follow");

    const updatedCurrentUser = await response.json();
    
    // LocalStorage madhe updated user thev mhanje app la mahit asel ki aapan konala follow kelay
    localStorage.setItem("snapgram_user", JSON.stringify(updatedCurrentUser));

    return updatedCurrentUser;
  } catch (error) {
    console.log(error);
  }
}
// ============================== GET LIKED POSTS (Spring Boot)
export async function getLikedPosts(userId: string) {
  try {
    const url = "http://localhost:8080/api/posts/liked/" + userId;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("Failed to get liked posts");

    const posts = await response.json();

    // Appwrite chya format madhe convert kar
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
