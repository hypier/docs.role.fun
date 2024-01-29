"use client";
import Content from "./content.mdx";

export default function Page() {
  return (
    <div className="container prose mx-auto break-words px-4 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
      <Content />
    </div>
  );
}
