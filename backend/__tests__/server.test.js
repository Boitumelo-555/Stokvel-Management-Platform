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
// Story: As an Admin, I want to archive a group so that inactive groups are removed 
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


// ── UAT 6: Save a pending invite ─────────────────────────────────────────────
// Story: As an Admin, I want to save a pending invite so that I can track
// who has been invited and their assigned role.
describe("POST /invites - Save a pending invite", () => {
  test("GIVEN valid details, WHEN I POST /invites, THEN invite is saved as pending", async () => {
    const res = await request(app)
      .post("/invites")
      .send({
        email: "thabo@email.com",
        name: "Thabo Mokoena",
        role: "member",
        group_id: null
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("thabo@email.com");
    expect(res.body.status).toBe("pending");
    expect(res.body.role).toBe("member");
  });

  test("GIVEN no email, WHEN I POST /invites, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/invites")
      .send({ name: "Thabo", role: "member" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN an invalid email, WHEN I POST /invites, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/invites")
      .send({ email: "notanemail", name: "Thabo", role: "member" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN no name, WHEN I POST /invites, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/invites")
      .send({ email: "thabo2@email.com", role: "member" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN an invalid role, WHEN I POST /invites, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/invites")
      .send({ email: "thabo3@email.com", name: "Thabo", role: "superuser" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("GIVEN a duplicate email, WHEN I POST /invites, THEN I receive a 409 error", async () => {
    await request(app)
      .post("/invites")
      .send({ email: "duplicate@email.com", name: "Thabo", role: "member" });

    const res = await request(app)
      .post("/invites")
      .send({ email: "duplicate@email.com", name: "Thabo", role: "member" });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});

// ── UAT 7: Get all invites ────────────────────────────────────────────────────
// Story: As an Admin, I want to view all pending invites so that I can
// track who has been invited.
describe("GET /invites - List all invites", () => {
  test("GIVEN invites exist, WHEN I GET /invites, THEN I receive a list", async () => {
    const res = await request(app).get("/invites");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── UAT 8: Cancel an invite ───────────────────────────────────────────────────
// Story: As an Admin, I want to cancel an invite so that
// uninvited people cannot join.
describe("DELETE /invites/:id - Cancel an invite", () => {
  let inviteId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/invites")
      .send({
        email: `cancel-${Date.now()}@email.com`,
        name: "Cancel Test",
        role: "member"
      });
    inviteId = res.body.id;
  });

  test("GIVEN a valid invite id, WHEN I DELETE /invites/:id, THEN it is cancelled", async () => {
    const res = await request(app).delete(`/invites/${inviteId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Invite cancelled successfully");
  });

  test("GIVEN an invalid invite id, WHEN I DELETE /invites/:id, THEN I receive a 404", async () => {
    const res = await request(app).delete("/invites/9999");

    expect(res.statusCode).toBe(404);
  });
});