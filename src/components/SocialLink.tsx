
const SocialLink = (props: {id: string, imgURL: string}) => {
    const {id, imgURL} = props;
    return (
    <a class="flex" href="">
        <img src={imgURL} alt={`${id} logo`} />
        <p>{`${id.substring(0,1).toUpperCase()}${id.substring(1,id.length)}`}</p>
    </a>
    )
}

export default SocialLink;