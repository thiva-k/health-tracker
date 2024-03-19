import React from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { AuthContext } from "../context/AuthContext";

const Home = () => {

  const {loading} = useUserRole();
  const { currentUser } = React.useContext(AuthContext);

  if(currentUser && loading){
    return null
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}

export default Home;
