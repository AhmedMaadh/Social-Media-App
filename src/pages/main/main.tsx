import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, dataBase } from "../../config/firebase";
import { getDocs , collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Post } from "./post"

export interface Post {
  docid: string,
  description: string,
  title: string,
  userId: string,
  userName: string,
}
export const Main = () => {
  const [thePosts , setPosts] = useState<Post[] | null>(null);
  const [user] = useAuthState(auth);
  const postsRef = collection(dataBase, "posts");
  const navigate = useNavigate();
  const addPost = () => {
    navigate("/createpost");
  };
  const getPosts = async () => {
    const data = await getDocs(postsRef);
    // we gonna map through each of them and we gonna get each individual doc
    // and for that doc will have an object with the data of the doc ...doc.data()
    //get the id of that specific document
    setPosts(data.docs.map((doc) => ({...doc.data(), docid: doc.id})) as Post[]
    );
  }
  useEffect(() => {
    getPosts()
  },[]);
  
  return (
    <>
      { user &&
        <div className="main">
          <p className="create-post" onClick={addPost}>Create Post</p>
          <div>
            {thePosts?.map((post) => (
              <Post post={post}/>
            ))}
          </div>
        </div>
      }
    </>
  );
};
