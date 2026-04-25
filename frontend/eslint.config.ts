import type { Linter } from "eslint";
import nextConfig from "eslint-config-next";

const eslintConfig: Linter.Config[] = [
  ...(nextConfig as Linter.Config[]),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
