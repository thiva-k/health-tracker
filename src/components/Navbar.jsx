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
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Dashboard', path: '/dashboard' },
  {name: 'About', path:'/about'}
];

const doctorPages = [{ name: 'Home', path: '/' }, { name: 'Patients', path: '/patients' }];
const settings = ['Profile', 'Logout'];

export function Navbar() {
  const { currentUser } = React.useContext(AuthContext);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null); // State to store user's role
  const [loading, setLoading] = React.useState(true); // State to track loading
  const navigate = useNavigate();

  // Function to fetch user's role from Firestore
  const fetchUserRole = async () => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role); // Set user's role in state
        setLoading(false); 
      }
    }
  };

  React.useEffect(() => {
    fetchUserRole(); // Fetch user's role when component mounts or currentUser changes
  }, [currentUser]);

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
    signInWithPopup(auth, provider)
      .then(async (result) => {
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
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        toast.error(errorMessage);
      });
  };

  const handleLogout = async () => {
    setAnchorElUser(null); 
    await auth.signOut();
    navigate("/"); // Navigate to home after logout
  };

  if (loading) {
    return null;
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
                ) : (
                  pages.map((page) => (
                    <MenuItem key={page.name} onClick={() => { handleCloseNavMenu(); navigate(page.path) }}>
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ))
                )}
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
              ) : (
                pages.map((page) => (
                  <Button
                    key={page.name}
                    onClick={() => navigate(page.path)}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                ))
              )}
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

