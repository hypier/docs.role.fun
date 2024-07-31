export default {
  logo: <span className="font-medium">📙 Role.fun 中文文档</span>,
  docsRepositoryBase:
    "https://github.com/Open-Roleplay-AI/Role.fun/tree/main/apps/docs",
  head: (
    <>
      <meta property="og:title" content="Role.fun Docs" />
      <meta
        property="og:description"
        content="Learn how to create engaging characters at Role.fun"
      />
    </>
  ),
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://nextra.site" target="_blank">
          Role.fun
        </a>
        .
      </span>
    ),
  },
};
