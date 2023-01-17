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

const getLanguages = async (project: string) => {
  const res = await octokit.request(`/repos/${project}/languages`);
  const languages = res.data;
  return languages as Record<string, number>;
};

export const getProjectData = async () => {
  const projects: Project[] = [];
  try {
    const res = await octokit.request("/user/repos");
    const projectsResponse = res.data;
    for (const project of projectsResponse) {
      const name = project.name as string;
      const full_name = project.full_name as string;
      const description = project.description as string | null;
      const isFork = project.fork as boolean;
      const count = await getCommitCount(full_name);
      const languages = await getLanguages(full_name);
      const languagesStringified = JSON.stringify(languages);
      const stars = project.stargazers_count as number;
      await prisma.project.upsert({
        where: {
          full_name: full_name,
        },
        update: {
          name,
          full_name,
          description: description !== null ? description : "",
          languages: languagesStringified,
          commit_count: count,
          stars,
          fork: isFork,
        },
        create: {
          name,
          full_name,
          description: description !== null ? description : "",
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
