"use client";
import Content from "./content.mdx";

export default function Page() {
  return (
    <div className="container prose mx-auto mb-16 break-words px-4 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
      <Content />
    </div>
  );
}
