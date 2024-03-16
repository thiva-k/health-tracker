// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6TSaHAwsYESzB9LidOZf095H-XQI_SjY",
  authDomain: "health-tracker-9757e.firebaseapp.com",
  projectId: "health-tracker-9757e",
  storageBucket: "health-tracker-9757e.appspot.com",
  messagingSenderId: "1003655118371",
  appId: "1:1003655118371:web:cc79419ae3d918f86f3b96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage();

export { auth, provider, db, storage,app };

// import React, { useContext } from "react";
// import {
//   AppBar,
//   Avatar,
//   Box,
//   Container,
//   IconButton,
//   Menu,
//   MenuItem,
//   Typography,
//   Toolbar,
//   Button
// } from "@mui/material";

// import { useNavigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { auth } from "../config/firebase";
// import { signInWithPopup } from "firebase/auth";
// import { provider, db } from "../config/firebase";

// export const Navbar = () => {
//   const { currentUser} = useContext(AuthContext);

//   const [anchorEl, setAnchorEl] = React.useState(null);
//   const open = Boolean(anchorEl);
//   const navigate = useNavigate();
//   const location = useLocation(); // Get the current location

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = async () => {
//     setAnchorEl(null); 
//     await auth.signOut().then(() => navigate("/"));
//   };

//   const handleLogin = async () => {
//     signInWithPopup(auth, provider)
//       .then(async (result) => {
//         const user = result.user;
//         if (user) {
//           // eslint-disable-next-line no-undef
//           await setDoc(doc(db, "webCustomers", user.uid), {
//             uid: user.uid,
//             displayName: user.displayName,
//             photoURL: user.photoURL,
//           });
//         }
//       })
//       .catch((error) => {
//         const errorMessage = error.message;
//         // eslint-disable-next-line no-undef
//         toast.error(errorMessage);
//       });
//   };

//   const tabs = [
//     { label: "Home", path: "/" },
//     { label: "Dashboard", path: "/dashboard" },
//   ];

//   if(currentUser){
//    return( 
//     <AppBar position="sticky" color="inherit">
//       <Container maxWidth="lg">
//         <Toolbar
//           disableGutters
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             paddingY: 1.2,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {tabs.map((tab) => (
//               <Typography
//                 key={tab.path}
//                 onClick={() => navigate(tab.path)}
//                 style={{
//                   cursor: "pointer",
//                   transition: "transform 0.1s",
//                   padding: "0.75rem",
//                   border: "2px solid transparent",
//                   fontWeight: "bold",
//                   ...(location.pathname === tab.path
//                     ? {
//                         transform: "scale(1.15)",
//                         backgroundColor: "#D3D1D0",
//                         color: "#000000",
//                       }
//                     : {}),
//                 }}
//                 variant="h7"
//                 color="inherit"
//                 component="div"
//               >
//                 {tab.label}
//               </Typography>
//             ))}
//           </Box>

//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            

           
//             <Typography
//               onClick={() => navigate("/my-profile")}
//               style={{ cursor: "pointer" }}
//               fontSize={15}
//               variant="h6"
//               color="inherit"
//               component="a"
//             >
//               My Profile
//             </Typography>

//             <IconButton
//               id="demo-positioned-menu"
//               onClick={handleClick}
//               size="small"
//               aria-controls={open ? "demo-positioned-menu" : undefined}
//               aria-haspopup="true"
//               aria-expanded={open ? "true" : undefined}
//             >
//               <Avatar
//                 src=ccccccccccccccc
//                 sx={{ width: 32, height: 32 }}
//               />
//             </IconButton>
//           </Box>
//         </Toolbar>

//         <div>
//           <Menu
//             id="demo-positioned-menu"
//             aria-labelledby="demo-positioned-button"
//             anchorEl={anchorEl}
//             open={open}
//             onClose={handleClose}
//             anchorOrigin={{
//               vertical: "top",
//               horizontal: "left",
//             }}
//             transformOrigin={{
//               vertical: "top",
//               horizontal: "left",
//             }}
//           >
//             <MenuItem
//               onClick={() => {
//                 navigate("/my-profile");
//                 handleClose();
//               }}
//             >
//               My Profile
//             </MenuItem>
//             <MenuItem onClick={handleLogout}>Logout</MenuItem>
//           </Menu>
//         </div>
//       </Container>
//     </AppBar>
//    ) 
//   }else{

//   return(<> 
   
//    <AppBar position="sticky" color="inherit">
//   <Container maxWidth="lg">
//     <Toolbar
//       disableGutters
//       sx={{
//         display: "flex",
//         justifyContent: "space-between",
//         paddingY: 1.2,
//       }}
//     >
//       <Box>
//         {/* Add any content you want to appear on the left side of the AppBar here */}
//       </Box>

//       <Box sx={{ display: "flex", gap: 2 }}>
//         <Button onClick={handleLogin} variant="outlined" color="primary">
//           Login
//         </Button>
//       </Box>
//     </Toolbar>
//   </Container>
// </AppBar>
 
//     </>)
//    }
// }