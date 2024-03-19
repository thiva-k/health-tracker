import { useUserRole } from '../context/UserRoleContext';

function Dashboard() {

  const {userRole,loading} = useUserRole();

  if(loading){
    return null
  }

  return (
    <div>
      {userRole === 'patient' ? (
        <h2>Dashboard</h2>
      ) : (
        <p>Not found</p>
      )}
    </div>
  );
}

export default Dashboard;
