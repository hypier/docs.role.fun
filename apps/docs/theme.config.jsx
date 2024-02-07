export default {
  logo: <span className="font-medium">📙 Openroleplay.ai Docs</span>,
  docsRepositoryBase:
    "https://github.com/Open-Roleplay-AI/openroleplay.ai/tree/main/apps/docs",
  head: (
    <>
      <meta property="og:title" content="Openroleplay.ai Docs" />
      <meta
        property="og:description"
        content="Learn how to create engaging characters at Openroleplay.ai"
      />
    </>
  ),
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://nextra.site" target="_blank">
          Openroleplay.ai
        </a>
        .
      </span>
    ),
  },
};
