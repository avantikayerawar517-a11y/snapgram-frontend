import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useSearchUsers } from "@/lib/react-query/queries"; // Navin Hook import kela

const AllUsers = () => {
  const { toast } = useToast();
  
  // Search sathi state variables
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500); // 500ms delay API spam thambavnyasathi

  // Original sagle users ghenyachi API
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  // Search kelele users ghenyachi API
  const { data: searchedUsers, isFetching: isSearchFetching } = useSearchUsers(debouncedSearch);

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return null;
  }

  // Jar search bar madhe kahi type kela asel tar true hoil
  const shouldShowSearchResults = searchValue !== "";

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">Search Users</h2>

        {/* Search Bar UI */}
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt="search" />
          <Input
            type="text"
            placeholder="Search users by name..."
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Loader dakhvne jevha API data aante */}
        {(isLoading && !creators) || isSearchFetching ? (
          <Loader />
        ) : (
          <ul className="user-grid mt-4">
            {shouldShowSearchResults ? (
              // Search Results dakhvne (TypeScript error fixed here)
              searchedUsers?.documents && searchedUsers.documents.length > 0 ? (
                searchedUsers.documents.map((creator: any) => (
                  <li key={creator?.$id} className="flex-1 min-w-[200px] w-full">
                    <UserCard user={creator} />
                  </li>
                ))
              ) : (
                <p className="text-light-4 mt-10 text-center w-full">No users found</p>
              )
            ) : (
              // Default Sagle Users dakhvne
              creators?.documents ? (
                creators.documents.map((creator: any) => (
                  <li key={creator?.$id} className="flex-1 min-w-[200px] w-full">
                    <UserCard user={creator} />
                  </li>
                ))
              ) : null
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;