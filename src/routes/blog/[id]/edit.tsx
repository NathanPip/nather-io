import { Navigate, useParams } from "solid-start"

const EditPostRedirect = () => {
    const params = useParams();
    return <Navigate href={`/blog/create/${params.id}`} />
}

export default EditPostRedirect;