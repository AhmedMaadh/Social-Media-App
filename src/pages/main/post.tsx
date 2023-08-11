import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { Post as Ipost } from "./main";
import { auth, dataBase } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";

interface Props {
  post: Ipost;
}
interface Like {
  likedId: string;
  userId: string;
}

export const Post = (Props: Props) => {
  const [likes , setLikes] = useState<Like[] | null>(null);
    const [user] = useAuthState(auth);
    const { post } = Props;
    
    const likesRef = collection(dataBase, "likes");

    const likesDoc = query(likesRef, where("postId" , "==" , post.docid ));

    const getLikes = async () => {
      const data = await getDocs(likesDoc);
      // it will sent to database
      setLikes(data.docs.map((doc) => ({ userId: doc.data().userId, likedId: doc.id })));
    }
    useEffect(() =>{
      getLikes();
    },[])
    const addLike = async () => {
      try {
        // we got it from postsList
        const newDoc = await addDoc(likesRef, {userId: user?.uid , postId: post.docid })
        // to rendering data in the UI
        if (user) {
          setLikes((prev) => 
          prev 
          ?[...prev , {userId: user.uid, likedId: newDoc.id}] 
          :[{userId: user.uid, likedId: newDoc.id }] )
          }
        } catch (err) {
          console.log(err);
        }
    };
    const removeLike = async () => {
      try {
        const likeToDeleteQuery = query(likesRef, 
          where("postId" , "==" , post.docid), 
          where("userId", "==", user?.uid) );
        const likeToDeleteData = await getDocs(likeToDeleteQuery);
        const likedId = likeToDeleteData.docs[0].id;
        const LikeToDelete = doc(dataBase, "likes", likedId);
        await deleteDoc(LikeToDelete);
        if (user) {
          setLikes(
            (prev) => prev && prev.filter((like) => like.likedId !== likedId)
            );
          }
        } catch (err) {
          console.log(err);
        }
    };

    const hasUserLiked = likes?.find((like) => like.userId === user?.uid);

  return (
    <div>
      <div className="post">
        <div className="header">
        <p>{post.userName}</p>
        <h1>{post.title}</h1>
        </div>
        <div className="body">
          <p>{post.description}</p>
        </div>
        <div className="footer">
          <button className="like" onClick={hasUserLiked? removeLike : addLike}>
            {hasUserLiked ? <>&#128078;</> : <>&#128077;</> }
          </button>
          {likes && <span>Likes:{likes?.length}</span>}
        </div>
      </div>
    </div>
  );
};
