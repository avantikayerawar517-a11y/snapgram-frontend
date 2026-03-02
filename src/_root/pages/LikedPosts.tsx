import { useState, useEffect } from "react";
import { GridPostList, Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
// Apli navin API import keli
import { getLikedPosts } from "@/lib/appwrite/api";

const LikedPosts = () => {
  const { user } = useUserContext();
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      setIsLoading(true);
      try {
        const res = await getLikedPosts(user.id);
        if (res && res.documents) {
          setLikedPosts(res.documents);
        }
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.id) {
      fetchLikes();
    }
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (likedPosts.length === 0) {
    return (
      <p className="text-light-4 mt-10 text-center w-full">
        No liked posts
      </p>
    );
  }

  return (
    <>
      <GridPostList posts={likedPosts} showStats={false} />
    </>
  );
};

export default LikedPosts;