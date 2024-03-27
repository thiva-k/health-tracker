import * as React from 'react';
import { AuthContext } from "../context/AuthContext";
import { auth } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { provider, db } from "../config/firebase";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUserRole } from '../context/UserRoleContext';


const pages = [
  { name: 'Home', path: '/' },
  { name: 'Book Appointment', path: '/appointment' },
  {name: 'Health Diary', path:'/diary'},
  {name: 'Health Tracker', path:'/tracker'},
  { name:'Chat', path:'/chat'},
];

const doctorPages = [{ name: 'Home', path: '/' }, { name: 'Patients', path: '/patients' }, { name: 'Chat', path: '/doctor/chat' }];
const settings = ['Profile', 'Logout'];

export function Navbar() {
  const { currentUser } = React.useContext(AuthContext);
  const {userRole,loading,setUserRole} = useUserRole();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();



  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      
      // Check if the document already exists
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        // Add user to Firestore only if the document doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          role: "patient" // Set default role for new users
        });
  
        // Set the userRole state for new users
        setUserRole("patient");
      } else {
        // If the user document exists, set the userRole state based on the role in the document
        const userData = docSnap.data();
        setUserRole(userData.role);
      }
  
    } catch (error) {
      const errorMessage = error.message;
      // eslint-disable-next-line no-undef
      toast.error(errorMessage);
    }
  };

  const handleLogout = async () => {
    setAnchorElUser(null); 
    await auth.signOut();
    setUserRole(null);
    navigate("/"); // Navigate to home after logout
  };

  if (currentUser && loading) {
    return null
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <HealthAndSafetyIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <MonitorHeartIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HEALTH TRACKER
          </Typography>

          {currentUser ? (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {/* Render doctorPages if user is doctor, otherwise render pages */}
                {userRole === "doctor" ? (
                    doctorPages.map((page) => (
                      <MenuItem key={page.name} onClick={() => { handleCloseNavMenu(); navigate(page.path) }}>
                        <Typography textAlign="center">{page.name}</Typography>
                      </MenuItem>
                    ))
                  ) : userRole === "patient" ? (
                    pages.map((page) => (
                      <MenuItem key={page.name} onClick={() => { handleCloseNavMenu(); navigate(page.path) }}>
                        <Typography textAlign="center">{page.name}</Typography>
                      </MenuItem>
                    ))
                  ) : null}

              </Menu>
            </Box>
          ) : null}

          {currentUser ? (
            
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 500,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              🛡️ HEALTH 📈
            </Typography>
            
          ) : null}

          {currentUser ? (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {/* Render doctorPages if user is doctor, otherwise render pages */}
              {userRole === "doctor" ? (
                doctorPages.map((page) => (
                  <Button
                    key={page.name}
                    onClick={() => navigate(page.path)}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                ))
              ) : userRole === "patient" ? (
                pages.map((page) => (
                  <Button
                    key={page.name}
                    onClick={() => navigate(page.path)}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                ))
              ) : null}
            </Box>
          ) : null}


          {!currentUser &&
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          }

          {currentUser && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar  src={currentUser?.photoURL} />
                  {console.log(currentUser?.photoURL)}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem 
                    key={setting} 
                    onClick={() => {
                      if (setting === 'Logout') {
                        handleLogout(); // Fire handleLogout if Logout button is clicked
                      } else {
                        handleCloseUserMenu();
                      }
                    }}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

