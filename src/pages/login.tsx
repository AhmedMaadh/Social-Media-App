import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
export const Login = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
    navigate("/main");
  };
  return (
    <>
    { !user &&
    <div className="log-in-page">
      <h1>Welcome To Rating Platform</h1>
      <p>
        Give your rating on things if it's <span className="under-text">U</span>der-Rated Or <span className="over-text">O</span>ver-Rated
      </p>
      <div className="header-two">
        <h2>Sign In With</h2>
        <button onClick={signInWithGoogle} className="sign-in-button">Google</button>
      </div>
    </div>
    }
    </>
  );
};

