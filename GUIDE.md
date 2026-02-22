# Learning Guide - JavaScript (Node.js)

> **Welcome to Product-Track Week 1, Hotfix 1!**
> This is a **hotfix task** - a single file that needs urgent bug fixes.
> Hotfixes simulate real production emergencies where you need to fix code quickly.

---

## What You Need To Do (Summary)

1. **Read the comments** at the top of `taskController.js` - they describe the problem
2. **Read** this guide to learn the JavaScript (Node.js) syntax you'll need
3. **Find the bugs** (search for `BUG` comments in the code)
4. **Fix each bug** using the hints provided
5. **Run the tests** (if included at the bottom of the file)

---

## JavaScript (Node.js) Quick Reference

### Variables and Types
```javascript
const name = "Alice";           // constant - can't be reassigned
let count = 42;                 // variable - can be reassigned
const items = [1, 2, 3];       // array
const config = {key: "value"};  // object
const isActive = true;          // boolean
// DON'T use 'var' - it has scoping issues
```

### Functions
```javascript
// Regular function
function greet(name, greeting = "Hello") {
    return ${greeting}, !;    // Template literal (backticks)
}

// Arrow function (shorter syntax, same thing)
const greet = (name) => Hello, !;

// Calling:
const result = greet("Alice");
```

### Classes
```javascript
class Calculator {
    constructor() {                     // Constructor
        this.history = [];              // 'this' = current object
    }

    add(a, b) {                         // Method
        const result = a + b;
        this.history.push(result);
        return result;
    }

    getHistory() {
        return [...this.history];       // Return a copy
    }
}

// Using it:
const calc = new Calculator();
calc.add(2, 3);
console.log(calc.getHistory());        // [5]

// Exporting (so other files can use it):
module.exports = Calculator;

// Importing:
const Calculator = require('./Calculator');
```

### Objects (Key-Value Storage)
```javascript
const user = {name: "Alice", age: 25};
user.name;                              // Access: "Alice"
user["name"];                           // Also works
user.email = "alice@test.com";          // Add/update
"name" in user;                         // Check key exists: true
const {name, age} = user;              // Destructuring
```

### Arrays
```javascript
const items = [1, 2, 3];
items.push(4);                          // Add to end
items.pop();                            // Remove last
items.length;                           // Length: 3
items.map(x => x * 2);                 // Transform: [2, 4, 6]
items.filter(x => x > 1);             // Filter: [2, 3]
items.forEach(item => console.log(item));  // Loop
```

### Error Handling
```javascript
try {
    const result = riskyOperation();
} catch (error) {
    console.error(Error: );
} finally {
    cleanup();
}
```

### Common Patterns You'll See
```javascript
// Null/undefined checks
if (!value) { return "Empty"; }             // falsy check
if (value === null) { return "Null"; }      // strict null check
if (value === undefined) { return "Undef"; } // strict undefined

// == vs === (IMPORTANT!)
"5" == 5      // true  (loose - converts types)
"5" === 5     // false (strict - checks type too)
// ALWAYS use === in real code

// Ternary operator
const status = isActive ? "active" : "inactive";

// Optional chaining
const city = user?.address?.city;  // undefined if any part is null
```

### How to Run Tests
```bash
# From the task folder:
npx jest tests/ --verbose

# Or if Jest is installed:
npm test
```

### How to Add a Test
```javascript
// In the test file:
test('should do something specific', () => {
    const obj = new MyClass();
    const result = obj.method(inputData);
    expect(result).not.toBeNull();        // Not null
    expect(result).toBe(expectedValue);   // Exact match
    expect(result.length).toBeGreaterThan(0);  // Comparison
});
```

---

## Project Structure

This is a **hotfix** - everything is in one file:

| File | Purpose |
|------|---------|
| `taskController.js` | The code with bugs - **fix this file** |
| `GUIDE.md` | This learning guide |

---

## Bugs to Fix

### Bug #1
**What's wrong:** ', priority: 'high' } }, res1);

**How to find it:** Search for `BUG` in `taskController.js` - the comments around each bug explain what's broken.


---

## How to Approach This

1. **Read the top comment block** in `taskController.js` carefully - it has:
   - The JIRA ticket description (what's happening in production)
   - Slack thread (discussion about the problem)
   - Acceptance criteria (checklist of what needs to work)
2. **Search for `BUG`** in the file to find each bug location
3. **Read the surrounding code** to understand what it's trying to do
4. **Fix the logic** based on the bug description
5. **Check the tests** at the bottom of the file and make sure they pass

---

## Common Mistakes to Avoid

- Don't change the structure of the code - only fix the buggy logic
- Read **all** the bugs before starting - sometimes fixing one helps you understand another
- Pay attention to the Slack thread comments - they often contain hints about the root cause
