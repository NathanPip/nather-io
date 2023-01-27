import { Octokit } from "octokit";
import { serverEnv } from "~/env/server";
import { prisma } from "~/server/db/client";

export const octokit = new Octokit({
  auth: serverEnv.GITHUB_TOKEN,
});

type Project = {
  name: string;
  full_name: string;
  description: string;
  languages: Record<string, number>;
  commit_count: number;
  stars: number;
  original_stars?: number;
  fork: boolean;
};

const getCommitCount = async (project: string) => {
  const res = await octokit.request(`/repos/${project}/commits`);
  let count = 0;
  for (const commit of res.data) {
    if (commit.committer.login === "NathanPip") {
      count++;
    }
  }
  return count;
};

const getTags = async (project: string) => {
  const res = await octokit.request(`/repos/${project}/topics`);
  const tags = res.data;
  return tags as {names: string[]};
};

const getLanguages = async (project: string) => {
  const res = await octokit.request(`/repos/${project}/languages`);
  const languages = res.data;
  return languages as Record<string, number>;
};

const isFeatured = (description: string | null): [boolean, string] => {
  if(description === null) return [false, ""];
  if(description.includes("[featured]")) 
  return [true, description.replace("[featured]", "")];
  else return [false, description];
}

export const getProjectData = async () => {
  const projects: Project[] = [];
  try {
    const res = await octokit.request("/user/repos");
    const projectsResponse = res.data;
    for (const project of projectsResponse) {
      if(project.private) continue;
      const name = project.name as string;
      const full_name = project.full_name as string;
      const description = project.description as string | null;
      const featured = isFeatured(description);
      const isFork = project.fork as boolean;
      const website = project.homepage as string | null;
      const count = await getCommitCount(full_name);
      const tags = await getTags(full_name);
      const languages = await getLanguages(full_name);
      const languagesStringified = JSON.stringify(languages);
      const tagsStringified = JSON.stringify(tags.names);
      const created_at = project.created_at as string;
      const updated_at = project.updated_at as string;
      const stars = project.stargazers_count as number;
      await prisma.project.upsert({
        where: {
          full_name: full_name,
        },
        update: {
          name,
          created_at: new Date(created_at),
          updated_at: new Date(updated_at),
          full_name,
          description: featured[1],
          featured: featured[0],
          website: website !== null ? website : "",
          tags: tagsStringified,
          languages: languagesStringified,
          commit_count: count,
          stars,
          fork: isFork,
        },
        create: {
          name,
          created_at: new Date(created_at),
          updated_at: new Date(updated_at),
          full_name,
          description: featured[1],
          featured: featured[0],
          website: website !== null ? website : "",
          tags: tagsStringified,
          languages: languagesStringified,
          commit_count: count,
          stars,
          fork: isFork,
        },
      });
    }
    return projects;
  } catch (err) {
    console.error(err);
    return err;
  }
};
