const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

exports.executeCode = async (code, language, testCases) => {
  const timestamp = Date.now();
  let fileName;
  let filePath;
  let dockerCmd;

  let finalCode = code;

  if (language === 'javascript') {
    fileName = `submission_${timestamp}.js`;
    filePath = path.join(TEMP_DIR, fileName);
    // Append test runner logic
    const testRunner = `
      const testCases = ${JSON.stringify(testCases)};
      
      // Helper to capture console.log if needed, but we rely on return value or specific output format
      // For this simple version, we assume the user code defines a function that we can call.
      // But we don't know the function name easily without parsing.
      // A better approach for JS is to expect the user to assign to module.exports or just define a function.
      // Let's assume the last defined function is the one to test, or we wrap it.
      
      // Actually, let's try to find the function name from the code or just append the call.
      // If the template is "function add(a,b) { ... }", we can append:
      
      async function runTests() {
        const results = [];
        for (const test of testCases) {
          try {
            // We need to invoke the user's function. 
            // Since we don't know the name, we can use a trick or regex.
            // Regex to find function name:
            // function\\s+(\\w+)
            
            // Simple regex to find the first function name
            // This is a bit brittle but works for MVP
          } catch (e) {
            results.push({ input: test.input, expected: test.output, actual: e.message, passed: false });
          }
        }
        console.log(JSON.stringify(results));
      }
      
      // runTests();
    `;

    // Better approach:
    // We can wrap the user code in a block and return the function, or use eval (unsafe but ok for sandbox).
    // Or simpler: We parse the function name from the code.
    const functionNameMatch = code.match(/function\s+(\w+)/);
    const functionName = functionNameMatch ? functionNameMatch[1] : 'solution';

    const testRunnerScript = `
      ${code}
      
      const testCases = ${JSON.stringify(testCases)};
      
      async function runTests() {
        const results = [];
        let allPassed = true;
        
        for (const test of testCases) {
          try {
            // Parse input arguments
            // Assuming input is a JSON string representing arguments array, e.g. "[1, 2]"
            const args = JSON.parse(test.input);
            
            const result = ${functionName}(...args);
            const actual = JSON.stringify(result);
            const expected = test.output; // Assuming output is also a string representation
            
            const passed = actual === expected;
            if (!passed) allPassed = false;
            
            results.push({ input: test.input, expected, actual, passed });
          } catch (e) {
            results.push({ input: test.input, expected: test.output, actual: e.message, passed: false });
            allPassed = false;
          }
        }
        
        console.log(JSON.stringify({ allPassed, results }));
      }
      
      runTests();
    `;

    finalCode = testRunnerScript;
    dockerCmd = `docker run --rm -v "${TEMP_DIR}:/app" -w /app codearena-sandbox node ${fileName}`;
  } else if (language === 'java') {
    // Java Logic
    // We assume the user provides a 'Solution' class.
    const solutionFileName = 'Solution.java';
    const solutionFilePath = path.join(TEMP_DIR, solutionFileName);
    fs.writeFileSync(solutionFilePath, code);

    // Parse method name to test
    // Look for a public method that is not 'main' and not a constructor 'Solution'
    // Regex: public <type> <name>(
    const methodMatches = [...code.matchAll(/public\s+(?!class)(\w+)\s+(\w+)\s*\(/g)];
    let methodName = 'solution';
    for (const match of methodMatches) {
      if (match[2] !== 'main' && match[2] !== 'Solution') {
        methodName = match[2];
        break;
      }
    }

    const testCasesJson = JSON.stringify(testCases).replace(/"/g, '\\"');

    const mainCode = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String testCasesStr = "${testCasesJson}";
        boolean allPassed = true;
        List<String> results = new ArrayList<>();
        
        Solution sol = new Solution();

        ${testCases.map(tc => {
      const args = JSON.parse(tc.input);
      const argsStr = args.join(', ');

      return `
            try {
                Object result = sol.${methodName}(${argsStr});
                String actual = String.valueOf(result);
                String expected = "${tc.output}";
                
                boolean passed = actual.equals(expected);
                if (!passed) allPassed = false;
                
                results.add(String.format("{\\"input\\": \\"${tc.input.replace(/"/g, '\\"')}\\", \\"expected\\": \\"%s\\", \\"actual\\": \\"%s\\", \\"passed\\": %b}", expected, actual, passed));
            } catch (Exception e) {
                allPassed = false;
                results.add(String.format("{\\"input\\": \\"${tc.input.replace(/"/g, '\\"')}\\", \\"expected\\": \\"${tc.output}\\", \\"actual\\": \\"%s\\", \\"passed\\": false}", e.getMessage()));
            }
            `;
    }).join('\n')}
        
        System.out.println("{\\"allPassed\\": " + allPassed + ", \\"results\\": [" + String.join(", ", results) + "]}");
    }
}
   `;

    // Write Main.java
    const mainFileName = 'Main.java';
    const mainFilePath = path.join(TEMP_DIR, mainFileName);
    fs.writeFileSync(mainFilePath, mainCode);

    try {
      // Compile both files
      const { stderr: compileStderr } = await execPromise(`docker run --rm --entrypoint "" -v "${TEMP_DIR}:/app" -w /app codearena-sandbox javac Solution.java Main.java`, { timeout: 10000 });

      if (compileStderr) {
        // Cleanup
        if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
        if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
        return { status: 'error', output: compileStderr };
      }

      // Run Main
      const { stdout, stderr } = await execPromise(`docker run --rm --entrypoint "" -v "${TEMP_DIR}:/app" -w /app codearena-sandbox java Main`, { timeout: 5000 });

      // Cleanup
      if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
      if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
      const classFiles = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.class'));
      classFiles.forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));

      if (stderr) return { status: 'error', output: stderr };

      try {
        const result = JSON.parse(stdout.trim());
        return { status: result.allPassed ? 'passed' : 'failed', output: JSON.stringify(result.results, null, 2) };
      } catch (e) {
        return { status: 'error', output: `Failed to parse output: ${stdout}` };
      }

    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
      if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
      const classFiles = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.class'));
      classFiles.forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));

      return { status: 'error', output: error.message || error.stderr };
    }
  } else {
    return { status: 'error', output: `Unsupported language: ${language}` };
  }

  // This block is now only for JavaScript execution
  fs.writeFileSync(filePath, finalCode);

  try {
    // Run in Docker
    // We mount the temp directory to /app in the container
    const { stdout, stderr } = await execPromise(dockerCmd, { timeout: 5000 }); // 5s timeout

    // Cleanup
    fs.unlinkSync(filePath);

    if (stderr) {
      return { status: 'error', output: stderr };
    }

    try {
      const result = JSON.parse(stdout.trim());
      return { status: result.allPassed ? 'passed' : 'failed', output: JSON.stringify(result.results, null, 2) };
    } catch (e) {
      return { status: 'error', output: `Failed to parse output: ${stdout}` };
    }

  } catch (error) {
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return { status: 'error', output: error.message || error.stderr };
  }
};
