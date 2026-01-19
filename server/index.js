const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Judge server running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


const PISTON_API = "https://emkc.org/api/v2/piston";

const languageConfig = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
};

const getFileName = (language) => {
  const extensions = {
    python: "main.py",
    javascript: "main.js",
    cpp: "main.cpp",
    java: "Main.java",
    c: "main.c",
  };
  return extensions[language] || "main.txt";
};

const execute = async ({ code, language, stdin }) => {
  const config = languageConfig[language];
  if (!config) {
    return { success: false, error: `Unsupported language: ${language}` };
  }

  const startTime = Date.now();

  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ name: getFileName(language), content: code }],
      stdin: stdin || "",
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
    }),
  });

  const result = await response.json();
  const timeMs = Date.now() - startTime;

  if (result.compile && result.compile.code !== 0) {
    return {
      success: false,
      status: "Compilation Error",
      output: result.compile.output || "",
      error: result.compile.stderr || "Compilation failed",
      timeMs,
    };
  }

  if (result.run) {
    const stdout = result.run.output || "";
    const stderr = result.run.stderr || "";

    if (result.run.code !== 0 || stderr) {
      return {
        success: false,
        status: "Runtime Error",
        output: stdout,
        error: stderr || `Exit code: ${result.run.code}`,
        timeMs,
      };
    }

    return {
      success: true,
      status: "Ran",
      output: stdout,
      timeMs,
    };
  }

  return { success: false, status: "Error", error: result.message || "Unknown error" };
};

app.post("/run", async (req, res) => {
  try {
    const { code, language, testcases = [] } = req.body || {};
    if (!code || !language) {
      return res.status(400).json({ success: false, error: "Missing code or language" });
    }

    const results = [];
    for (const tc of testcases) {
      const result = await execute({ code, language, stdin: tc.input });
      results.push({
        input: tc.input,
        expected: tc.output,
        output: (result.output || '').trim(),
        verdict: (result.output || '').trim() === (tc.output || '').trim() ? 'Accepted' : 'Wrong Answer',
        error: result.error || '',
      });
    }
    res.json({ results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
});

app.post("/submit", async (req, res) => {
  try {
    const { code, language, testcases = [] } = req.body || {};
    if (!code || !language) {
      return res.status(400).json({ success: false, error: "Missing code or language" });
    }

    for (let i = 0; i < testcases.length; i += 1) {
      const testcase = testcases[i];
      const result = await execute({ code, language, stdin: testcase.input || "" });

      if (!result.success) {
        return res.json({
          success: false,
          status: result.status || "Error",
          output: result.output || "",
          error: result.error || "",
          executionTime: result.timeMs ? `${result.timeMs}ms` : undefined,
        });
      }

      const expected = (testcase.output || "").trim();
      const actual = (result.output || "").trim();

      if (expected !== actual) {
        return res.json({
          success: false,
          status: "Wrong Answer",
          output: actual,
          expectedOutput: expected,
          failedCase: { index: i + 1, input: testcase.input || "" },
          executionTime: result.timeMs ? `${result.timeMs}ms` : undefined,
        });
      }
    }

    return res.json({
      success: true,
      status: "Accepted",
      output: "All test cases passed.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Judge server running on http://localhost:${PORT}`);
});
