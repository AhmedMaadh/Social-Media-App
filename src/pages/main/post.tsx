import { addDoc, collection, deleteDoc, doc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { Post as Ipost } from "./main";
import * as yup from "yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup";
import { auth, dataBase } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
// import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

interface Props {
  post: Ipost;
};
interface Like {
  likedId: string;
  userId: string;
};
interface Comment {
  comment: string;
  commentId:string;
  userName: string;
  userId:string;
  postId: string;
};

export const Post = (Props: Props) => {
  const [likes , setLikes] = useState<Like[] | null>(null);
  // const [comments , setComments] = useState<Comment[] | null>(null);
  const [Comments, setComments] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  const { post } = Props;
    
    const likesRef = collection(dataBase, "likes");
    const commentsRef = collection(dataBase, "comments");

    const likesDocs = query(likesRef, where("postId" , "==" , post.docid));
    // const commentsDocs = query(commentsRef, where("postId" , "==" , post.docid));
    
    const getLikes = async () => {
      const data = await getDocs(likesDocs);
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
        // so when we update to databese will also setLikes to the var(likes)
        if (user) {
          setLikes((prev) => prev 
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
    const schema = yup.object({
      comment: yup.string(),
  });
  const { register , handleSubmit} = useForm <Comment | any>({
    resolver: yupResolver(schema),
});
    const onCreatComments = async (data: Comment) => {
    await addDoc(commentsRef, {
      ...data,
      userName: user?.displayName,
      userId: user?.uid,
      postId: post.docid,
    });
  };
  // const getComments = async () => {
  //   const data = await getDocs(commentsDocs);
  //   setData(data.docs.map((doc) => ({...doc.data(), commentId: doc.id})) as Comment[]
  //   );
  // };
  

  useEffect(() => {
    const fetchData = async () => {
      const colRef = query(commentsRef, where("postId" , "==" , post.docid));
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => doc.data());
        setComments(fetchedData);
      });

      return () => {
        unsubscribe(); // Clean up the listener when the component unmounts
      };
    };
    fetchData();
  }, []);


    // useEffect(() => {
    //   getComments()
    //   // addComment()
    // },[]);
  
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
          <p className="comments-label">Comments:{Comments?.length}</p>
        <div className="comment">
          {Comments?.map((coment) => (
            <div>
            {/* <span><img src={user?.photoURL || ""} alt="" width={25} height={25} /></span> */}
            <p className="diaply-user-name">{coment.userName}</p>
            <p className="each-comment">{coment.comment}</p>
            </div>
          ))}
        </div>
        <div className="footer">
          <button className="like" onClick={hasUserLiked? removeLike : addLike}>
            {hasUserLiked ? <>&#128078;</> : <>&#128077;</> }
          </button>
          {likes && <span>Likes:{likes?.length}</span>}
          <form onSubmit={handleSubmit(onCreatComments)} className="comment-form">
            <input className="type-comment" placeholder="add Comment" {...register("comment")}/>
            <button type="submit" className="send-comment"><FontAwesomeIcon icon={faPaperPlane}/></button>
          </form>
        </div>
      </div>
    </div>
  );
};
