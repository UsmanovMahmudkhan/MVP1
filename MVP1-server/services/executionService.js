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
  console.log(`[ExecutionService] Starting execution for ${language}`);
  console.log(`[ExecutionService] Code length: ${code.length}`);

  const timestamp = Date.now();
  let fileName;
  let filePath;
  let dockerCmd;

  let finalCode = code;

  if (language === 'javascript') {
    fileName = `submission_${timestamp}.js`;
    filePath = path.join(TEMP_DIR, fileName);

    // More robust approach: wrap user code and find any exported function
    const testRunnerScript = `
      ${code}
      
      const testCases = ${JSON.stringify(testCases)};
      
      // Find the first function defined in the user's code
      // This works for: function name(), const name = () => {}, etc.
      function findUserFunction() {
        // Get all function names from global scope
        const functionNames = Object.keys(global).filter(key => {
          return typeof global[key] === 'function' && 
                 !key.startsWith('_') && 
                 !key.startsWith('testCases') &&
                 key !== 'findUserFunction' &&
                 key !== 'runTests';
        });
        
        // Also check for functions in this scope
        const localFunctions = [];
        const codeLines = \`${code.replace(/`/g, '\\`')}\`.split('\\n');
        
        // Match: function name(...) or const/let/var name = 
        for (const line of codeLines) {
          const funcMatch = line.match(/function\\s+(\\w+)\\s*\\(/);
          if (funcMatch) localFunctions.push(funcMatch[1]);
          
          const arrowMatch = line.match(/(?:const|let|var)\\s+(\\w+)\\s*=\\s*(?:\\([^)]*\\)|\\w+)\\s*=>/);
          if (arrowMatch) localFunctions.push(arrowMatch[1]);
        }
        
        // Try to find the function in global scope first
        for (const name of localFunctions) {
          if (typeof eval(name) === 'function') {
            return eval(name);
          }
        }
        
        // Fallback: try common names
        const commonNames = ['solution', 'solve', 'main', 'answer'];
        for (const name of commonNames) {
          try {
            if (typeof eval(name) === 'function') {
              return eval(name);
            }
          } catch (e) {}
        }
        
        return null;
      }
      
      async function runTests() {
        const results = [];
        let allPassed = true;
        
        const userFunction = findUserFunction();
        
        if (!userFunction) {
          console.log(JSON.stringify({ 
            allPassed: false, 
            results: [{ error: 'Could not find a function to test. Please define a function in your code.' }] 
          }));
          return;
        }
        
        for (const test of testCases) {
          try {
            // Parse input arguments
            const args = JSON.parse(test.input);
            
            const result = userFunction(...args);
            const actual = JSON.stringify(result);
            const expected = test.output;
            
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
    // Java Logic - More robust approach
    const solutionFileName = 'Solution.java';
    const solutionFilePath = path.join(TEMP_DIR, solutionFileName);
    fs.writeFileSync(solutionFilePath, code);

    // Find all public methods (excluding main, constructors, and class declaration)
    const methodMatches = [...code.matchAll(/public\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/g)];
    let methodName = null;
    let returnType = 'Object';
    let paramNames = [];

    for (const match of methodMatches) {
      const type = match[1];
      const name = match[2];
      const paramsStr = match[3];

      // Skip constructors, main method, and class declarations
      if (name !== 'main' && name !== 'Solution' && type !== 'class') {
        methodName = name;
        returnType = type;

        // Extract parameter names
        if (paramsStr.trim()) {
          paramNames = paramsStr.split(',').map(p => {
            const parts = p.trim().split(/\s+/);
            return parts[parts.length - 1];
          });
        }
        break;
      }
    }

    // Fallback to common method names if not found (but we won't have param names)
    if (!methodName) {
      const commonNames = ['solution', 'solve', 'answer', 'calculate'];
      for (const name of commonNames) {
        if (code.includes(`public`) && code.includes(name)) {
          methodName = name;
          break;
        }
      }
    }

    if (!methodName) {
      // Cleanup
      if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
      return { status: 'error', output: 'Could not find a public method to test in Solution class' };
    }

    // Transform test cases if input is a JSON object and we have param names
    const transformedTestCases = testCases.map(tc => {
      try {
        // Check if input looks like a JSON object (starts with { and ends with })
        const trimmedInput = tc.input.trim();
        if (trimmedInput.startsWith('{') && trimmedInput.endsWith('}') && paramNames.length > 0) {
          const inputObj = JSON.parse(trimmedInput);
          // Check if it's not an array (JSON objects in JS are objects, arrays are also objects)
          if (!Array.isArray(inputObj)) {
            // Map to array based on paramNames
            const args = paramNames.map(name => {
              if (Object.prototype.hasOwnProperty.call(inputObj, name)) {
                return inputObj[name];
              }
              return null; // Or undefined, will become null in JSON
            });
            return { ...tc, input: JSON.stringify(args) };
          }
        }
      } catch (e) {
        // Ignore parsing errors, pass as is
      }
      return tc;
    });

    // Generate Main.java with reflection-based approach for more flexibility
    const mainCode = `
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            Class<?> clazz = sol.getClass();
            
            // Find the method to test
            Method targetMethod = null;
            for (Method method : clazz.getDeclaredMethods()) {
                String methodName = method.getName();
                int modifiers = method.getModifiers();
                
                // Find public methods that aren't main or constructors
                if (Modifier.isPublic(modifiers) && 
                    !methodName.equals("main") && 
                    !methodName.equals("Solution")) {
                    targetMethod = method;
                    break;
                }
            }
            
            if (targetMethod == null) {
                System.out.println("{\\"allPassed\\": false, \\"results\\": [{\\"error\\": \\"No testable method found\\"}]}");
                return;
            }
            
            // Test cases
            String[][] testCases = {
                ${transformedTestCases.map(tc => {
      const escapedInput = tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const escapedOutput = tc.output.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `{"${escapedInput}", "${escapedOutput}"}`;
    }).join(',\n                ')}
            };
            
            boolean allPassed = true;
            List<String> results = new ArrayList<>();
            
            for (String[] testCase : testCases) {
                try {
                    String input = testCase[0];
                    String expected = testCase[1];
                    
                    // Parse input arguments
                    String[] argsArray = parseArgs(input);
                    Object[] methodArgs = convertArgs(argsArray, targetMethod.getParameterTypes());
                    
                    // Invoke method
                    Object result = targetMethod.invoke(sol, methodArgs);
                    String actual = String.valueOf(result);
                    
                    boolean passed = actual.equals(expected);
                    if (!passed) allPassed = false;
                    
                    results.add(String.format("{\\"input\\": \\"%s\\", \\"expected\\": \\"%s\\", \\"actual\\": \\"%s\\", \\"passed\\": %b}", 
                        escapeJson(input), escapeJson(expected), escapeJson(actual), passed));
                } catch (Exception e) {
                    allPassed = false;
                    Throwable cause = e.getCause() != null ? e.getCause() : e;
                    results.add(String.format("{\\"input\\": \\"%s\\", \\"expected\\": \\"%s\\", \\"actual\\": \\"%s\\", \\"passed\\": false}", 
                        escapeJson(testCase[0]), escapeJson(testCase[1]), escapeJson(cause.getMessage())));
                }
            }
            
            System.out.println("{\\"allPassed\\": " + allPassed + ", \\"results\\": [" + String.join(", ", results) + "]}");
            
        } catch (Exception e) {
            System.out.println("{\\"allPassed\\": false, \\"results\\": [{\\"error\\": \\"" + escapeJson(e.getMessage()) + "\\"}]}");
        }
    }
    
    private static String[] parseArgs(String input) {
        List<String> args = new ArrayList<>();
        int bracketCount = 0;
        int braceCount = 0;
        boolean inQuote = false;
        StringBuilder current = new StringBuilder();
        
        // Remove outer brackets if present (for array inputs)
        input = input.trim();
        if (input.startsWith("[") && input.endsWith("]")) {
            input = input.substring(1, input.length() - 1);
        }
        
        for (char c : input.toCharArray()) {
            if (c == '"' && (current.length() == 0 || current.charAt(current.length() - 1) != '\\\\')) {
                inQuote = !inQuote;
            }
            if (!inQuote) {
                if (c == '[') bracketCount++;
                if (c == ']') bracketCount--;
                if (c == '{') braceCount++;
                if (c == '}') braceCount--;
                
                if (c == ',' && bracketCount == 0 && braceCount == 0) {
                    args.add(current.toString().trim());
                    current.setLength(0);
                    continue;
                }
            }
            current.append(c);
        }
        if (current.length() > 0) {
            args.add(current.toString().trim());
        }
        
        return args.toArray(new String[0]);
    }
    
    private static Object[] convertArgs(String[] args, Class<?>[] paramTypes) throws Exception {
        Object[] result = new Object[args.length];
        
        for (int i = 0; i < args.length && i < paramTypes.length; i++) {
            String arg = args[i].trim();
            Class<?> type = paramTypes[i];
            
            // Handle JSON objects - pass as String for user to parse (fallback)
            if (arg.startsWith("{") && arg.endsWith("}")) {
                // If param is not String, this might fail later, but we let it pass here
                // unless we want to try to parse it into an object?
                // For now, assume complex objects are passed as strings if the user wants them.
                // But for int[], we need to parse arrays.
            }
            
            // Remove quotes if present for strings, but NOT for arrays/objects
            if (type == String.class && arg.startsWith("\\"") && arg.endsWith("\\"")) {
                arg = arg.substring(1, arg.length() - 1);
            }
            
            if (type == int.class || type == Integer.class) {
                result[i] = Integer.parseInt(arg);
            } else if (type == long.class || type == Long.class) {
                result[i] = Long.parseLong(arg);
            } else if (type == double.class || type == Double.class) {
                result[i] = Double.parseDouble(arg);
            } else if (type == boolean.class || type == Boolean.class) {
                result[i] = Boolean.parseBoolean(arg);
            } else if (type == String.class) {
                result[i] = arg;
            } else if (type == int[].class) {
                // Parse int array
                result[i] = parseIntArray(arg);
            } else {
                result[i] = arg; // Default to string or let invoke fail
            }
        }
        return result;
    }

    private static int[] parseIntArray(String arg) {
        arg = arg.trim();
        if (arg.equals("[]")) return new int[0];
        if (arg.startsWith("[") && arg.endsWith("]")) {
            arg = arg.substring(1, arg.length() - 1);
        }
        String[] parts = arg.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        return arr;
    }
    
    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "\\\\r");
    }
}
`;

    // Write Main.java
    const mainFileName = 'Main.java';
    const mainFilePath = path.join(TEMP_DIR, mainFileName);
    fs.writeFileSync(mainFilePath, mainCode);

    try {
      // Compile both files
      console.log('[ExecutionService] Compiling Java...');
      const { stderr: compileStderr } = await execPromise(`docker run --rm --entrypoint "" -v "${TEMP_DIR}:/app" -w /app codearena-sandbox javac Solution.java Main.java`, { timeout: 10000 });

      if (compileStderr) {
        console.error('[ExecutionService] Compilation error:', compileStderr);
        // Cleanup
        if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
        if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
        return { status: 'error', output: compileStderr };
      }

      // Run Main
      console.log('[ExecutionService] Running Java...');
      const { stdout, stderr } = await execPromise(`docker run --rm --entrypoint "" -v "${TEMP_DIR}:/app" -w /app codearena-sandbox java Main`, { timeout: 5000 });

      console.log('[ExecutionService] Java execution output:', stdout);
      if (stderr) console.error('[ExecutionService] Java execution stderr:', stderr);

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
      console.error('[ExecutionService] Java error:', error);
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
    console.log(`[ExecutionService] Running Docker command: ${dockerCmd}`);
    const { stdout, stderr } = await execPromise(dockerCmd, { timeout: 5000 }); // 5s timeout

    console.log('[ExecutionService] Execution stdout:', stdout);
    if (stderr) console.error('[ExecutionService] Execution stderr:', stderr);

    // Cleanup
    fs.unlinkSync(filePath);

    if (stderr) {
      return { status: 'error', output: stderr };
    }

    try {
      const result = JSON.parse(stdout.trim());
      return { status: result.allPassed ? 'passed' : 'failed', output: JSON.stringify(result.results, null, 2) };
    } catch (e) {
      console.error('[ExecutionService] JSON parse error:', e);
      return { status: 'error', output: `Failed to parse output: ${stdout}` };
    }

  } catch (error) {
    console.error('[ExecutionService] Docker execution error:', error);
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return { status: 'error', output: error.message || error.stderr };
  }
};
