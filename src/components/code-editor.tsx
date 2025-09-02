import { Editor, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  code: string;
  lang: string;
  onChange: (value: string | undefined) => void;
}

export const CodeEditor = ({ code, lang, onChange }: CodeEditorProps) => {
  const { theme } = useTheme();

  const mapLanguage = (lang: string) => {
    switch (lang) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      default:
        return lang;
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowUnreachableCode: true,
      allowUnusedLabels: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
    });
  };

  return (
    <Editor
      height="100%"
      language={mapLanguage(lang)}
      value={code}
      onChange={onChange}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};
