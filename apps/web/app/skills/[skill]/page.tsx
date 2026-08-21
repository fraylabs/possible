import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkillDetailPage } from "../../../src/App";
import { getPublishedSkill, getSkillOutcomes, publishedSkills, skillHref } from "../../../src/public-content";
import { pageMetadata, siteUrl } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedSkills.map(({ slug }) => ({ skill: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ skill: string }> }): Promise<Metadata> {
  const { skill: slug } = await params;
  const record = getPublishedSkill(slug);
  if (!record) return {};
  const feature = getSkillOutcomes(record.id).find(({ outcome }) => outcome.preview?.images?.length || outcome.preview?.video || outcome.preview?.cad?.poster);
  const image = feature?.outcome.preview?.images?.find(({ cover }) => cover) ?? feature?.outcome.preview?.images?.[0];
  const socialSource = image?.src ?? feature?.outcome.preview?.video?.poster ?? feature?.outcome.preview?.cad?.poster;
  const socialUrl = socialSource?.startsWith("https://") ? socialSource : socialSource ? `${siteUrl}${socialSource}` : undefined;
  return pageMetadata({
    title: record.name,
    description: `${record.name} from ${record.repository}, shown through the Outcomes that use it.`,
    path: skillHref(record),
    socialImage: socialUrl ? { url: socialUrl, alt: image?.alt ?? `${record.name} Outcome preview` } : null,
  });
}

export default async function SkillPage({ params }: { params: Promise<{ skill: string }> }) {
  const { skill: slug } = await params;
  const record = getPublishedSkill(slug);
  if (!record) notFound();
  return <SkillDetailPage id={record.id} />;
}
