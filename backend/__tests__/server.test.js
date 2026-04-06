const request = require("supertest");
const app = require("../server");

// ── UAT 1: Group Creation ─────────────────────────────────────────────────────
// Story: As an Admin, I want to create a stokvel group so that members can be onboarded.
describe("POST /groups - Create a group", () => {
  test("GIVEN valid group details, WHEN I POST /groups, THEN a new group is created", async () => {
    const res = await request(app)
      .post("/groups")
      .send({
        name: "Savings Circle",
        contribution_amount: 500,
        meeting_frequency: "monthly",
        payout_order: "round-robin"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Savings Circle");
    expect(res.body.contribution_amount).toBe(500);
    expect(res.body.meeting_frequency).toBe("monthly");
  });

  test("GIVEN no group name, WHEN I POST /groups, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/groups")
      .send({ contribution_amount: 500, meeting_frequency: "monthly" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN no contribution amount, WHEN I POST /groups, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/groups")
      .send({ name: "Test Group", meeting_frequency: "monthly" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN no meeting frequency, WHEN I POST /groups, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/groups")
      .send({ name: "Test Group", contribution_amount: 500 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ── UAT 2: Get all groups ─────────────────────────────────────────────────────
// Story: As an Admin, I want to view all groups so that I can manage them.
describe("GET /groups - List all groups", () => {
  test("GIVEN groups exist, WHEN I GET /groups, THEN I receive a list", async () => {
    const res = await request(app).get("/groups");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── UAT 3: Get single group ───────────────────────────────────────────────────
// Story: As an Admin, I want to view a specific group's details.
describe("GET /groups/:id - Get a single group", () => {
  let groupId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({
        name: "Test Group",
        contribution_amount: 300,
        meeting_frequency: "monthly"
      });
    groupId = res.body.id;
  });

  test("GIVEN a valid group id, WHEN I GET /groups/:id, THEN I receive the group", async () => {
    const res = await request(app).get(`/groups/${groupId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(groupId);
  });

  test("GIVEN an invalid group id, WHEN I GET /groups/:id, THEN I receive a 404", async () => {
    const res = await request(app).get("/groups/9999");

    expect(res.statusCode).toBe(404);
  });
});

// ── UAT 4: Update group config ────────────────────────────────────────────────
// Story: As an Admin, I want to update group settings so that they reflect changes.
describe("PATCH /groups/:id - Update a group", () => {
  let groupId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({
        name: "Original Name",
        contribution_amount: 500,
        meeting_frequency: "monthly"
      });
    groupId = res.body.id;
  });

  test("GIVEN a valid update, WHEN I PATCH /groups/:id, THEN the group is updated", async () => {
    const res = await request(app)
      .patch(`/groups/${groupId}`)
      .send({ name: "Updated Name", contribution_amount: 750 });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.contribution_amount).toBe(750);
  });

  test("GIVEN an invalid group id, WHEN I PATCH /groups/:id, THEN I receive a 404", async () => {
    const res = await request(app)
      .patch("/groups/9999")
      .send({ name: "Updated Name" });

    expect(res.statusCode).toBe(404);
  });
});

// ── UAT 5: Delete a group ─────────────────────────────────────────────────────
// Story: As an Admin, I want to archive a group so that inactive groups are removed.
describe("DELETE /groups/:id - Archive a group", () => {
  let groupId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({
        name: "Group to Archive",
        contribution_amount: 500,
        meeting_frequency: "monthly"
      });
    groupId = res.body.id;
  });

  test("GIVEN a valid group id, WHEN I DELETE /groups/:id, THEN the group is removed", async () => {
    const res = await request(app).delete(`/groups/${groupId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Group archived successfully");
  });

  test("GIVEN an invalid group id, WHEN I DELETE /groups/:id, THEN I receive a 404", async () => {
    const res = await request(app).delete("/groups/9999");

    expect(res.statusCode).toBe(404);
  });
});