import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
export const Navbar = () => {
  const navigate = useNavigate()
  // the auth from our config firebase auth
  const [user] = useAuthState(auth);
  const signUserOut = async () => {
    await signOut(auth);
    navigate("/")
  };
  return (
    <>
      {!user && (<Link to="/" className="log-in-text">Login</Link>)}
      <div className="navbar">
          <div className="container">
          {user &&
          <>
          <div className="user">
            <button className="sign-out" onClick={signUserOut}>Sign out</button>
            <img src={user?.photoURL || ""} alt="" width={35} height={35} />
            <p>{user?.displayName}</p>
            <div className="home-div">
            <Link to="/main" className="home">Home</Link>
            </div>
          </div>
          </>}
        </div>
      </div>
      </>
    )
};
