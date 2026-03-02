import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
// Aapli followUser API import keli
import { followUser } from "@/lib/appwrite/api";

type UserCardProps = {
  user: any;
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: currentUser } = useUserContext();
  
  const [followers, setFollowers] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.followers) {
      setFollowers(user.followers);
    }
  }, [user]);

  const isFollowing = followers.includes(currentUser.id);

  const handleFollow = async (e: any) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    let newFollowers = followers.slice();
    if (isFollowing) {
      newFollowers = newFollowers.filter((id) => id !== currentUser.id);
    } else {
      newFollowers.push(currentUser.id);
    }
    setFollowers(newFollowers);

    try {
      await followUser(currentUser.id, user.$id);
    } catch (error) {
      console.error("Follow failed");
      setFollowers(user.followers || []);
    }
  };

  return (
    <Link to={"/profile/" + user.$id} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          {"@" + user.username}
        </p>
      </div>

      {currentUser.id !== user.$id && (
        <Button 
          type="button" 
          size="sm" 
          className={"px-5 " + (isFollowing ? "bg-dark-4 text-light-1" : "shad-button_primary")}
          onClick={handleFollow}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </Link>
  );
};

export default UserCard;