/**
 * ====================================================================
 *  JIRA: PLATFORM-2825 — Fix Task Title Null Dereference in Create API
 * ====================================================================
 *  Priority: P0 — Sev1 | Sprint: Sprint 23 | Points: 2
 *  Reporter: Sarah Kim (QA Lead)
 *  Assignee: You (Intern)
 *  Due: ASAP — production incident ongoing
 *  Labels: production, api, crash, node
 *
 *  DESCRIPTION:
 *  The POST /api/tasks endpoint is throwing TypeError in production when
 *  clients send requests with missing or malformed title fields. Error
 *  rate spiked to 12% after last deployment. Rollback is not an option
 *  because the same deploy included a critical security patch.
 *
 *  STEPS TO REPRODUCE:
 *  1. Send POST /api/tasks with body: { "description": "no title here" }
 *  2. Server crashes with: TypeError: Cannot read properties of null
 *     (reading 'trim')
 *  3. Send POST with body: { "title": "", "priority": "urgent" }
 *  4. Returns 200 OK with null data instead of 400 validation error
 *
 *  ACCEPTANCE CRITERIA:
 *  - [ ] Null/undefined/empty title returns 400 with clear error message
 *  - [ ] Invalid priority values are rejected (valid: low, medium, high, critical)
 *  - [ ] Successful creation returns 201 with task object
 *  - [ ] Errors return appropriate status codes (400, 500), never 200
 *  - [ ] All 6 test cases at the bottom of this file pass
 * ====================================================================
 *
 *  SLACK THREAD — #backend-incidents — Feb 12, 2026:
 *  ──────────────────────────────────────────────────
 *  @sarah.kim (QA) 2:15 PM:
 *    "We're seeing ~200 TypeErrors per hour from the task service.
 *     Stack trace points to taskController.js line 48. Looks like
 *     .trim() is being called on undefined."
 *
 *  @devops-bot 2:16 PM:
 *    "🚨 Alert: task-service error rate exceeded 10% threshold.
 *     Pod restarts: 3 in last 15 minutes."
 *
 *  @raj.patel (Senior Dev) 2:20 PM:
 *    "It's the title field. The mobile app team pushed an update that
 *     sometimes sends null title. We never validated that. Also I just
 *     noticed the catch block returns 200 — that's masking errors."
 *
 *  @nisha.gupta (Tech Lead) 2:22 PM:
 *    "@intern can you pick this up? It's a quick fix — just add input
 *     validation before the trim() call and fix the error status code.
 *     Check the priority validation too, I don't think it's working."
 *
 *  PRODUCTION ERROR LOG (last 30 minutes):
 *  ────────────────────────────────────────
 *  [2026-02-12T14:15:23Z] ERROR task-service-pod-7fb4a — TypeError:
 *    Cannot read properties of null (reading 'trim')
 *      at createTask (taskController.js:48)
 *      at Layer.handle [as handle_request] (router/layer.js:95)
 *  [2026-02-12T14:15:23Z] ERROR Response sent: 200 OK { data: null }
 *  [2026-02-12T14:18:45Z] ERROR task-service-pod-7fb4a — TypeError:
 *    Cannot read properties of undefined (reading 'trim')
 *      at createTask (taskController.js:48)
 *  ... (pattern repeats 47 more times in the last 30 minutes)
 *
 * ====================================================================
 */

'use strict';

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

// ─── In-Memory Task Store (simulates database) ───────────────────────

let taskIdCounter = 1;
const tasks = [];

function createTaskInDB(data) {
    const task = { id: taskIdCounter++, ...data, createdAt: new Date().toISOString() };
    tasks.push(task);
    return task;
}

function getAllTasks() {
    return tasks;
}

// ─── API Response Helpers ─────────────────────────────────────────────

function successResponse(data) {
    return { success: true, data, error: null };
}

function errorResponse(message) {
    return { success: false, data: null, error: message };
}

// ─── Route Handlers ──────────────────────────────────────────────────

/**
 * POST /api/tasks — Create a new task
 * Expected body: { title: string, description?: string, priority?: string, assignee?: string }
 */
function createTask(req, res) {
    try {
        const { title, description, priority, assignee, dueDate } = req.body;

        // Sanitize title — THIS IS WHERE THE CRASH HAPPENS
        // If title is null/undefined, calling .trim() throws TypeError
        const sanitizedTitle = title.trim();

        // Validate priority
        const taskPriority = priority || 'medium';
        // This doesn't actually validate against VALID_PRIORITIES — any string passes through

        const task = createTaskInDB({
            title: sanitizedTitle,
            description: description || '',
            priority: taskPriority,
            assignee: assignee || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'open'
        });

        return res.status(201).json(successResponse(task));

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error creating task:`, error.message);
        // Returns 200 OK on error — this masks the problem from monitoring
        return res.status(200).json(successResponse(null));
    }
}

/**
 * GET /api/tasks — List all tasks
 */
function listTasks(req, res) {
    const { status, priority } = req.query;
    let result = getAllTasks();

    if (status) {
        result = result.filter(t => t.status === status);
    }
    if (priority) {
        result = result.filter(t => t.priority === priority);
    }

    return res.status(200).json(successResponse(result));
}

// ─── Exports ─────────────────────────────────────────────────────────

module.exports = { createTask, listTasks };


/* =====================================================================
 *  TESTS — Run these to verify your fix
 *  Command: node -e "require('./taskController.test.js')"
 *  (or paste into your test runner)
 * =====================================================================
 *
 *  function mockRes() {
 *      const r = { statusCode: null, body: null };
 *      r.status = (c) => { r.statusCode = c; return r; };
 *      r.json = (d) => { r.body = d; return r; };
 *      return r;
 *  }
 *
 *  // TEST 1: Valid task creation → should return 201
 *  const res1 = mockRes();
 *  createTask({ body: { title: 'Fix login bug', priority: 'high' } }, res1);
 *  console.assert(res1.statusCode === 201, 'TEST 1 FAILED: expected 201');
 *  console.assert(res1.body.success === true, 'TEST 1 FAILED: expected success');
 *
 *  // TEST 2: Missing title (undefined) → should return 400, NOT crash
 *  const res2 = mockRes();
 *  createTask({ body: { description: 'no title' } }, res2);
 *  console.assert(res2.statusCode === 400, 'TEST 2 FAILED: expected 400');
 *  console.assert(res2.body.success === false, 'TEST 2 FAILED: expected failure');
 *
 *  // TEST 3: Null title → should return 400
 *  const res3 = mockRes();
 *  createTask({ body: { title: null } }, res3);
 *  console.assert(res3.statusCode === 400, 'TEST 3 FAILED: expected 400');
 *
 *  // TEST 4: Empty string title → should return 400
 *  const res4 = mockRes();
 *  createTask({ body: { title: '   ' } }, res4);
 *  console.assert(res4.statusCode === 400, 'TEST 4 FAILED: expected 400');
 *
 *  // TEST 5: Invalid priority → should return 400
 *  const res5 = mockRes();
 *  createTask({ body: { title: 'Test', priority: 'urgent' } }, res5);
 *  console.assert(res5.statusCode === 400, 'TEST 5 FAILED: expected 400');
 *
 *  // TEST 6: Errors should NEVER return 200
 *  const res6 = mockRes();
 *  createTask({ body: {} }, res6);
 *  console.assert(res6.statusCode !== 200, 'TEST 6 FAILED: errors must not return 200');
 *
 * =====================================================================
 */
