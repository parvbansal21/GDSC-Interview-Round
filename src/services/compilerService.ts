// Code compilation service using Piston API (free, no API key needed)
// Supports: Python, JavaScript, C++, Java, and more

const PISTON_API = "https://emkc.org/api/v2/piston";

export type Language = "python" | "javascript" | "cpp" | "java" | "c";

interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

interface ExecuteResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: string;
}

// Language configurations for Piston API
const languageConfig: Record<Language, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
};

// Get available runtimes
export const getRuntimes = async (): Promise<PistonRuntime[]> => {
  try {
    const response = await fetch(`${PISTON_API}/runtimes`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch runtimes:", error);
    return [];
  }
};

// Execute code
export const executeCode = async (
  code: string,
  language: Language,
  stdin: string = ""
): Promise<ExecuteResult> => {
  const config = languageConfig[language];
  
  if (!config) {
    return {
      success: false,
      output: "",
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [
          {
            name: getFileName(language),
            content: code,
          },
        ],
        stdin: stdin,
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    const result = await response.json();
    const executionTime = `${Date.now() - startTime}ms`;

    if (result.run) {
      const output = result.run.output || "";
      const stderr = result.run.stderr || "";
      
      if (result.run.code !== 0 || stderr) {
        return {
          success: false,
          output: output,
          error: stderr || `Exit code: ${result.run.code}`,
          executionTime,
        };
      }

      return {
        success: true,
        output: output.trim(),
        executionTime,
      };
    }

    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: "",
        error: result.compile.stderr || result.compile.output || "Compilation failed",
        executionTime,
      };
    }

    return {
      success: false,
      output: "",
      error: result.message || "Unknown error occurred",
    };
  } catch (error: any) {
    return {
      success: false,
      output: "",
      error: error?.message || "Failed to execute code. Check your internet connection.",
    };
  }
};

// Get file extension for language
const getFileName = (language: Language): string => {
  const extensions: Record<Language, string> = {
    python: "main.py",
    javascript: "main.js",
    cpp: "main.cpp",
    java: "Main.java",
    c: "main.c",
  };
  return extensions[language];
};

// Get starter code for each language
export const getStarterCode = (language: Language): string => {
  const starters: Record<Language, string> = {
    python: `# Write your solution here
def solution():
    # Your code here
    pass

# Test your solution
print(solution())
`,
    javascript: `// Write your solution here
function solution() {
    // Your code here
}

// Test your solution
console.log(solution());
`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

// Write your solution here
int main() {
    // Your code here
    
    return 0;
}
`,
    java: `public class Main {
    public static void main(String[] args) {
        // Write your solution here
        
    }
}
`,
    c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
  };
  return starters[language];
};

// Display names for languages
export const languageNames: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
  c: "C",
};
