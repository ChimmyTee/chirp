import { UserProfile } from "@clerk/nextjs";
 
const UserProfilePage2 = () => (
  <UserProfile path="/user-profile" routing="path" />
);
 
export default UserProfilePage2;