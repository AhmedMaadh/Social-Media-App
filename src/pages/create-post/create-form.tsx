import { useForm } from "react-hook-form"
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc , collection } from "firebase/firestore";
import { auth, dataBase } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";


interface CreateFormData {
    title: string,
    description: string,
};

export const CreateForm = () => {
    const [user] = useAuthState(auth);

    const navigate = useNavigate();

    const schema = yup.object({
        title: yup.string().required("You need to add title"),
        description: yup.string().required("you need to add description")
    });

    const { register , handleSubmit, formState:{errors}} = useForm <CreateFormData>({
        resolver: yupResolver(schema),
    });

    // we chosed the collection posts in our firestore
    const postsRef = collection(dataBase, "posts");

    const onCreatePost = async (data: CreateFormData) => {
        await addDoc(postsRef, {
            ...data,
            userName: user?.displayName,
            userId: user?.uid,
        })
        navigate("/main")
    };

    return (
        <>
        <form  className="container" onSubmit={handleSubmit(onCreatePost)}>
            <input className="title-text" placeholder="Title..." {...register("title")}/>
            <p style={{color: "black"}}>{errors?.title?.message}</p>
            <textarea placeholder="Description..."{...register("description")}/>
            <p style={{color: "black"}}>{errors?.description?.message}</p>
            <input className="form-submit" type="submit" />
        </form>
        {/* <p>back</p> */}
        </>
    );
};