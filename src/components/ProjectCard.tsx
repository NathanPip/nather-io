import { type Project } from "@prisma/client";

const ProjectCard = (props: {project: Project}) => {

    return (
        <div class="mb-6 bg-stone-300 shadow-lg relative p-4">
            <h3>{props.project.name}</h3>
            <p>{props.project.description}</p>
            <div class="absolute top-0 right-0 m-4">Stars {props.project.stars}</div>
            <a href={`https://github.com/${props.project.full_name}`}>Github</a>
            {props.project.website.length && <a href={props.project.website}>Live Site</a>}
        </div>
    )
}

export default ProjectCard;