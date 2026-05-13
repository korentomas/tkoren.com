import { Octokit } from "@octokit/rest";

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const OWNER = "korentomas";
const REPO = "tkoren.com";
const BRANCH = "main";

function client(): Octokit {
  return new Octokit({ auth: envOrThrow("GITHUB_TOKEN") });
}

export type FileSha = { sha: string };

export async function getFileSha(path: string): Promise<string | null> {
  const octo = client();
  try {
    const res = await octo.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    if (Array.isArray(res.data)) return null;
    if (!("sha" in res.data)) return null;
    return res.data.sha;
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function commitJsonFile(args: {
  path: string;
  data: unknown;
  message: string;
}): Promise<{ commitUrl: string }> {
  const octo = client();
  const sha = await getFileSha(args.path);
  const content = Buffer.from(JSON.stringify(args.data, null, 2) + "\n", "utf8").toString("base64");
  const res = await octo.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    content,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  });
  const commitUrl = res.data.commit.html_url ?? "";
  return { commitUrl };
}

export async function commitBinaryFile(args: {
  path: string;
  contentBase64: string;
  message: string;
}): Promise<{ commitUrl: string }> {
  const octo = client();
  const sha = await getFileSha(args.path);
  const res = await octo.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    content: args.contentBase64,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  });
  return { commitUrl: res.data.commit.html_url ?? "" };
}

export async function listDirectory(path: string): Promise<{ name: string; downloadUrl: string | null }[]> {
  const octo = client();
  try {
    const res = await octo.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    if (!Array.isArray(res.data)) return [];
    return res.data.map((entry) => ({ name: entry.name, downloadUrl: entry.download_url }));
  } catch (err: any) {
    if (err?.status === 404) return [];
    throw err;
  }
}

export async function deleteFile(args: { path: string; message: string }): Promise<void> {
  const octo = client();
  const sha = await getFileSha(args.path);
  if (!sha) return;
  await octo.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    sha,
    branch: BRANCH,
  });
}
