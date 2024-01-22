"use client";
import Content from "./content.mdx";

export default function Page() {
  return (
    <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 container mx-auto break-words px-4">
      <Content />
    </div>
  );
}
